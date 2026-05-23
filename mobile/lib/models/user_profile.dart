class UserProfile {
  UserProfile({
    required this.id,
    this.nom,
    this.email,
    this.telephone,
    this.role = 'buyer',
    this.actif = true,
    this.verifie = false,
    this.deletedAt,
    this.deactivatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: '${json['id']}',
      nom: json['nom']?.toString(),
      email: json['email']?.toString(),
      telephone: json['telephone']?.toString(),
      role: json['role']?.toString() ?? 'buyer',
      actif: json['actif'] != false,
      verifie: json['verifie'] == true,
      deletedAt: json['deleted_at'] != null
          ? DateTime.tryParse('${json['deleted_at']}')
          : null,
      deactivatedAt: json['deactivated_at'] != null
          ? DateTime.tryParse('${json['deactivated_at']}')
          : null,
    );
  }

  final String id;
  final String? nom;
  final String? email;
  final String? telephone;
  final String role;
  final bool actif;
  final bool verifie;
  final DateTime? deletedAt;
  final DateTime? deactivatedAt;

  bool get isSeller => role == 'seller';
  bool get isAdmin => role == 'admin' || role == 'superadmin';
  bool get canManageCatalog => isSeller || isAdmin;

  bool get isAccessible =>
      deletedAt == null && actif;

  String get displayName =>
      (nom != null && nom!.trim().isNotEmpty) ? nom!.trim() : (email ?? 'Mon compte');
}
