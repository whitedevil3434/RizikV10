class FoodItem {
  final String id;
  final String name;
  final String? nameBn;
  final String image;
  final double price;
  final double rating;
  final String category;
  final String partnerName;
  final String? description;
  final bool isAvailable;

  FoodItem({
    required this.id,
    required this.name,
    this.nameBn,
    required this.image,
    required this.price,
    required this.rating,
    required this.category,
    required this.partnerName,
    this.description,
    this.isAvailable = true,
  });

  factory FoodItem.fromJson(Map<String, dynamic> json) {
    return FoodItem(
      id: json['id'] as String,
      name: json['name'] as String,
      nameBn: json['nameBn'] as String?,
      image: json['image'] as String,
      price: (json['price'] as num).toDouble(),
      rating: (json['rating'] as num).toDouble(),
      category: json['category'] as String,
      partnerName: json['partnerName'] as String,
      description: json['description'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nameBn': nameBn,
      'image': image,
      'price': price,
      'rating': rating,
      'category': category,
      'partnerName': partnerName,
      'description': description,
      'isAvailable': isAvailable,
    };
  }
}
