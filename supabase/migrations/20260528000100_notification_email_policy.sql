-- Politique notifications : catalogue / stock / packs = in-app uniquement (pas d'email webhook).
-- Admins : notif in-app à chaque publication produit (hors packs en attente).

-- ─── 1) Nouveau produit → notif admin in-app (standard, catalog) ───────────
create or replace function public.fn_notify_admins_new_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin record;
  v_label text;
  v_seller text;
  v_link text;
begin
  if TG_OP <> 'INSERT' then
    return NEW;
  end if;
  if coalesce(NEW.is_pack, false) is true then
    return NEW;
  end if;
  if coalesce(NEW.actif, false) is not true then
    return NEW;
  end if;
  if to_regclass('public.notifications') is null or to_regclass('public.profiles') is null then
    return NEW;
  end if;

  v_label := coalesce(nullif(trim(NEW.name_fr), ''), nullif(trim(NEW.name_en), ''), 'Produit');
  v_seller := coalesce(nullif(trim(NEW.vendeur_nom), ''), 'Vendeur');
  v_link := '/admin?tab=produits';

  for v_admin in
    select p.id
    from public.profiles p
    where p.role in ('admin', 'superadmin')
  loop
    insert into public.notifications (user_id, type, title, message, link, lu, category, priority)
    values (
      v_admin.id,
      'new_product',
      '🆕 Nouveau produit publié',
      v_seller || ' · « ' || left(v_label, 120) || ' » · ' || coalesce(nullif(trim(NEW.ville), ''), '—'),
      v_link,
      false,
      'catalog',
      'standard'
    );
  end loop;

  return NEW;
end;
$$;

drop trigger if exists trg_notify_admins_new_product on public.products;
create trigger trg_notify_admins_new_product
  after insert on public.products
  for each row execute function public.fn_notify_admins_new_product();

-- ─── 2) Messagerie pair-à-pair : métadonnées explicites ────────────────────
create or replace function public.fn_notify_peer_chat_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv public.conversations%rowtype;
  v_recipient uuid;
  v_preview text;
  v_sender_name text;
begin
  if to_regclass('public.conversations') is null
     or to_regclass('public.notifications') is null then
    return NEW;
  end if;

  select * into v_conv
  from public.conversations c
  where c.id = NEW.conversation_id;

  if not found then
    return NEW;
  end if;

  if v_conv.user1_id = coalesce(NEW.sender_id, NEW.expediteur_id) then
    v_recipient := v_conv.user2_id;
  elsif v_conv.user2_id = coalesce(NEW.sender_id, NEW.expediteur_id) then
    v_recipient := v_conv.user1_id;
  else
    return NEW;
  end if;

  if v_recipient is null or v_recipient = coalesce(NEW.sender_id, NEW.expediteur_id) then
    return NEW;
  end if;

  select coalesce(p.nom, 'Un membre Yorix') into v_sender_name
  from public.profiles p
  where p.id = coalesce(NEW.sender_id, NEW.expediteur_id);

  v_preview := left(
    coalesce(NEW.content, case when NEW.image_url is not null then '📷 Photo' else 'Nouveau message' end),
    180
  );

  insert into public.notifications (user_id, type, title, message, link, lu, category, priority, payload)
  values (
    v_recipient,
    'new_message',
    '💬 ' || v_sender_name,
    v_preview,
    '/dashboard?tab=messages',
    false,
    'messages',
    'important',
    jsonb_build_object(
      'conversation_id', v_conv.id,
      'sender_id', coalesce(NEW.sender_id, NEW.expediteur_id)
    )
  );

  return NEW;
end;
$$;

-- ─── 3) Modération packs : métadonnées in-app (pas d'email) ─────────────────
create or replace function public.fn_admin_moderate_product_pack(
  p_product_id uuid,
  p_action text,
  p_admin_notes text default null,
  p_rejection_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_seller uuid;
  v_title text;
  v_msg text;
  v_notif_title text;
begin
  if not public.is_platform_admin() then
    raise exception 'Accès refusé';
  end if;

  select * into v_product from public.products where id = p_product_id;
  if not found or v_product.is_pack is not true then
    raise exception 'Pack introuvable';
  end if;

  v_seller := v_product.vendeur_id;
  v_title := coalesce(v_product.name_fr, 'Votre pack');

  if p_action = 'approve' then
    update public.products set
      pack_status = 'approved',
      actif = true,
      pack_admin_notes = nullif(trim(p_admin_notes), ''),
      pack_rejection_reason = null
    where id = p_product_id;

    v_notif_title := '✅ Pack approuvé';
    v_msg := 'Votre pack « ' || v_title || ' » est publié sur Yorix.';
    insert into public.notifications (user_id, type, title, message, link, lu, category, priority)
    values (v_seller, 'pack_moderation', v_notif_title, v_msg, '/dashboard', false, 'business', 'standard');

    return jsonb_build_object('ok', true, 'action', 'approve');

  elsif p_action = 'correction' then
    update public.products set
      pack_status = 'correction',
      actif = false,
      pack_admin_notes = nullif(trim(p_admin_notes), ''),
      pack_rejection_reason = null
    where id = p_product_id;

    v_notif_title := '✏️ Pack à corriger';
    v_msg := coalesce(nullif(trim(p_admin_notes), ''), 'Merci de corriger votre fiche pack.') ||
      E'\n\nPack : ' || v_title;
    insert into public.notifications (user_id, type, title, message, link, lu, category, priority)
    values (v_seller, 'pack_moderation', v_notif_title, v_msg, '/dashboard', false, 'business', 'standard');

    return jsonb_build_object('ok', true, 'action', 'correction');

  elsif p_action = 'reject' then
    v_msg := coalesce(nullif(trim(p_rejection_reason), ''), 'Pack non conforme aux règles Yorix.');
    insert into public.notifications (user_id, type, title, message, link, lu, category, priority)
    values (
      v_seller,
      'pack_moderation',
      '❌ Pack refusé',
      'Votre pack « ' || v_title || ' » a été refusé. Raison : ' || v_msg,
      '/dashboard',
      false,
      'business',
      'standard'
    );
    delete from public.products where id = p_product_id;
    return jsonb_build_object('ok', true, 'action', 'reject', 'deleted', true);

  else
    raise exception 'Action invalide (approve, correction, reject)';
  end if;
end;
$$;
