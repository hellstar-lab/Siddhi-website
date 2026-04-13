export interface MenuItem {
  id: string
  name: string
  price: string
  description: string
  category: string
  isVeg: boolean
  pexelsQuery: string
  imageUrl?: string
}

export const menuCategories = [
  { id: "starters", label: "Starters", icon: "🍢", color: "#E8A020" },
  { id: "fast-food", label: "Fast Food", icon: "🍟", color: "#C4380A" },
  { id: "breakfast", label: "Breakfast", icon: "🍽️", color: "#5A7A3A" },
  { id: "chaat", label: "Chaat", icon: "🥙", color: "#8B1A1A" },
  { id: "burger-pizza", label: "Burger & Pizza", icon: "🍕", color: "#C4380A" },
  { id: "south-indian", label: "South Indian", icon: "🫓", color: "#5A7A3A" },
  { id: "hot-cold", label: "Hot & Cold", icon: "☕", color: "#E8A020" },
]

export const menuItems: MenuItem[] = [
  { id: "1", name: "Paneer Tikka", price: "₹200", description: "Soft paneer cubes marinated in spiced yogurt, grilled in tandoor to perfection", category: "starters", isVeg: true, pexelsQuery: "paneer tikka indian food" },
  { id: "2", name: "Paneer Malai Tikka", price: "₹220", description: "Creamy malai marinated paneer with mild spices, melt-in-mouth tandoor grilled", category: "starters", isVeg: true, pexelsQuery: "malai paneer tikka creamy" },
  { id: "3", name: "Paneer Afghani Tikka", price: "₹200", description: "Rich Afghani spiced paneer tikka with cashew and cream marinade", category: "starters", isVeg: true, pexelsQuery: "afghani paneer tikka" },
  { id: "4", name: "Tandoori Tea", price: "₹160", description: "Smoky aromatic tea brewed in a clay pot with hand-picked spices", category: "starters", isVeg: true, pexelsQuery: "tandoori chai clay pot tea" },
  { id: "5", name: "Afghani Chaap Tikka", price: "₹160", description: "Soya chaap in rich Afghani marinade, grilled in clay tandoor", category: "starters", isVeg: true, pexelsQuery: "soya chaap tikka indian" },
  { id: "6", name: "Tandoori Momos (8pcs)", price: "₹160", description: "Steamed momos finished in tandoor with a smoky char and mint chutney", category: "starters", isVeg: true, pexelsQuery: "tandoori momos indian street food" },
  { id: "7", name: "Tandoori Platter", price: "₹280", description: "Chef's selection of our finest tandoori items — perfect for sharing", category: "starters", isVeg: true, pexelsQuery: "tandoori platter indian appetizer" },
  { id: "8", name: "Malai Chaap", price: "₹180", description: "Soya chaap soaked in cream and mild spices, silky smooth texture", category: "starters", isVeg: true, pexelsQuery: "malai chaap soya indian" },
  { id: "9", name: "Mushroom Tikka", price: "₹200", description: "Fresh button mushrooms marinated in tandoori spices and char-grilled", category: "starters", isVeg: true, pexelsQuery: "mushroom tikka grilled indian" },
  { id: "10", name: "French Fries", price: "₹60", description: "Golden crispy potato fries seasoned with our signature spice blend", category: "fast-food", isVeg: true, pexelsQuery: "crispy golden french fries" },
  { id: "11", name: "Pizza Potato", price: "₹60", description: "Potato wedges topped with pizza sauce, cheese and Italian herbs", category: "fast-food", isVeg: true, pexelsQuery: "pizza potato wedges cheese" },
  { id: "12", name: "Sweet Chilli Potato", price: "₹70", description: "Crispy potato tossed in tangy sweet chilli sauce with spring onion", category: "fast-food", isVeg: true, pexelsQuery: "sweet chilli potato crispy" },
  { id: "13", name: "Delhi Paneer Dry", price: "₹100", description: "Paneer tossed in bold Delhi-style dry masala with peppers and onion", category: "fast-food", isVeg: true, pexelsQuery: "dry paneer masala indian" },
  { id: "14", name: "Delhi Paneer Gravy", price: "₹120", description: "Paneer in rich Delhi-style gravy with tomato and aromatic spices", category: "fast-food", isVeg: true, pexelsQuery: "paneer gravy indian curry" },
  { id: "15", name: "Manchurian Dry (5pcs)", price: "₹60", description: "Crispy veggie balls in Indo-Chinese dry manchurian sauce", category: "fast-food", isVeg: true, pexelsQuery: "vegetable manchurian dry chinese" },
  { id: "16", name: "Spring Roll", price: "₹80", description: "Crispy golden rolls stuffed with seasoned vegetables and noodles", category: "fast-food", isVeg: true, pexelsQuery: "crispy spring rolls chinese" },
  { id: "17", name: "Momos Steamed (Full/Half)", price: "₹70/₹40", description: "Handmade steamed dumplings with spiced vegetable filling and red chutney", category: "fast-food", isVeg: true, pexelsQuery: "steamed momos dumplings indian" },
  { id: "18", name: "Momos Fried (Full/Half)", price: "₹90/₹50", description: "Crispy fried dumplings with golden exterior and soft filling inside", category: "fast-food", isVeg: true, pexelsQuery: "fried momos crispy dumplings" },
  { id: "19", name: "Chowmein", price: "₹50", description: "Classic stir-fried noodles with fresh vegetables in savory sauce", category: "fast-food", isVeg: true, pexelsQuery: "chowmein noodles indian street" },
  { id: "20", name: "Double Chowmein", price: "₹70", description: "Extra large portion of our classic chowmein — for the big appetite", category: "fast-food", isVeg: true, pexelsQuery: "chowmein noodles stir fry" },
  { id: "21", name: "Schezwan Chowmein", price: "₹80", description: "Fiery Schezwan noodles with bold Indo-Chinese flavors and crunchy veggies", category: "fast-food", isVeg: true, pexelsQuery: "schezwan chowmein spicy noodles" },
  { id: "22", name: "Pav Bhaji", price: "₹60", description: "Mumbai-style spiced mashed vegetable bhaji with buttered toasted pav", category: "fast-food", isVeg: true, pexelsQuery: "pav bhaji mumbai street food" },
  { id: "23", name: "Extra Pav", price: "₹20", description: "Soft buttered pav buns, toasted on tawa", category: "fast-food", isVeg: true, pexelsQuery: "pav bread butter toasted" },
  { id: "24", name: "Pasta (Red Sauce)", price: "₹80", description: "Penne pasta in rich tomato basil red sauce with Italian herbs", category: "fast-food", isVeg: true, pexelsQuery: "red sauce pasta tomato" },
  { id: "25", name: "Pasta (White Sauce)", price: "₹100", description: "Creamy béchamel pasta with garlic, cheese and mixed herbs", category: "fast-food", isVeg: true, pexelsQuery: "white sauce pasta creamy" },
  { id: "26", name: "Chole Bhature (Full/Half)", price: "₹50/₹30", description: "Punjabi-style spiced chickpea curry with fluffy deep-fried bhatura", category: "breakfast", isVeg: true, pexelsQuery: "chole bhature punjabi breakfast" },
  { id: "27", name: "Samosa", price: "₹15", description: "Crispy pastry filled with spiced potatoes and peas — the classic Indian snack", category: "chaat", isVeg: true, pexelsQuery: "samosa crispy indian snack" },
  { id: "28", name: "Tikki", price: "₹25", description: "Spiced potato patty pan-fried golden crisp, served with chutneys", category: "chaat", isVeg: true, pexelsQuery: "aloo tikki potato patty indian" },
  { id: "29", name: "Bhalla Papdi", price: "₹50", description: "Soft lentil dumplings with papdi, yogurt, tamarind and green chutney", category: "chaat", isVeg: true, pexelsQuery: "dahi bhalla papdi chaat" },
  { id: "30", name: "Golgappa with Water (5pcs)", price: "₹25", description: "Crispy hollow puris filled with spiced tangy jaljeera water — street classic", category: "chaat", isVeg: true, pexelsQuery: "golgappa pani puri indian street food" },
  { id: "31", name: "Golgappa with Curd (5pcs)", price: "₹35", description: "Crispy puris filled with creamy curd, sweet chutney and sev", category: "chaat", isVeg: true, pexelsQuery: "dahi puri golgappa curd" },
  { id: "32", name: "Raj Kachori", price: "₹60", description: "Giant crispy kachori loaded with chole, curd, chutneys and sev", category: "chaat", isVeg: true, pexelsQuery: "raj kachori indian chaat" },
  { id: "33", name: "Plain Burger", price: "₹40", description: "Soft bun with crispy veggie patty, fresh lettuce and our special sauce", category: "burger-pizza", isVeg: true, pexelsQuery: "veggie burger plain simple" },
  { id: "34", name: "Cheese Burger", price: "₹60", description: "Loaded cheese burger with melted cheese slice and tangy sauce", category: "burger-pizza", isVeg: true, pexelsQuery: "cheese burger melted" },
  { id: "35", name: "Pizza (Small)", price: "₹80", description: "Personal size pizza with tomato sauce, mozzarella and fresh toppings", category: "burger-pizza", isVeg: true, pexelsQuery: "small veggie pizza mozzarella" },
  { id: "36", name: "Pizza (Medium)", price: "₹150", description: "Medium pizza with generous toppings, rich sauce and golden crust", category: "burger-pizza", isVeg: true, pexelsQuery: "medium pizza golden crust" },
  { id: "37", name: "Plain Dosa", price: "₹60", description: "Thin crispy golden rice crepe served with sambar and coconut chutney", category: "south-indian", isVeg: true, pexelsQuery: "plain dosa crispy south indian" },
  { id: "38", name: "Masala Dosa", price: "₹70", description: "Golden crispy dosa stuffed with spiced potato masala and chutneys", category: "south-indian", isVeg: true, pexelsQuery: "masala dosa south indian" },
  { id: "39", name: "Paneer Dosa", price: "₹100", description: "Crispy dosa filled with spiced paneer bhurji — a rich fusion delight", category: "south-indian", isVeg: true, pexelsQuery: "paneer dosa south indian" },
  { id: "40", name: "Tea", price: "₹20", description: "Hot freshly brewed Indian chai with ginger and cardamom", category: "hot-cold", isVeg: true, pexelsQuery: "indian masala chai tea hot" },
  { id: "41", name: "Lassi (Seasonal)", price: "₹40", description: "Chilled thick yogurt lassi — sweet or salted, made fresh daily", category: "hot-cold", isVeg: true, pexelsQuery: "lassi yogurt drink indian" },
  { id: "42", name: "Coffee (Seasonal)", price: "₹25", description: "Hot freshly brewed coffee with rich aroma", category: "hot-cold", isVeg: true, pexelsQuery: "hot coffee cup indian cafe" },
  { id: "43", name: "Cold Drinks", price: "On MRP", description: "Assorted chilled cold beverages — Pepsi, 7Up, Mirinda and more", category: "hot-cold", isVeg: true, pexelsQuery: "cold drink soda chilled" },
  { id: "44", name: "Mineral Water", price: "On MRP", description: "Chilled packaged mineral drinking water", category: "hot-cold", isVeg: true, pexelsQuery: "mineral water bottle cold" },
]
