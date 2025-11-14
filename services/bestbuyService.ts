import { Product } from '../types';

// A larger mock database of products to simulate an "Amazon-like" e-commerce store
const MOCK_BESTBUY_PRODUCTS: Product[] = [
  // Electronics
  { id: 'prod_macbook_pro', name: 'MacBook Pro 14"', price: 1999, image: 'https://picsum.photos/seed/macbookpro/200/200' },
  { id: 'prod_macbook_air', name: 'MacBook Air 13"', price: 999, image: 'https://picsum.photos/seed/macbookair/200/200' },
  { id: 'prod_surface', name: 'Microsoft Surface Pro 9', price: 1299, image: 'https://picsum.photos/seed/surface/200/200' },
  { id: 'prod_dell_xps', name: 'Dell XPS 15 Laptop', price: 1599, image: 'https://picsum.photos/seed/dellxps/200/200' },
  { id: 'prod_ipad_air', name: 'iPad Air', price: 799, image: 'https://picsum.photos/seed/ipadair/200/200' },
  { id: 'prod_galaxy_tab', name: 'Samsung Galaxy Tab S9', price: 899, image: 'https://picsum.photos/seed/galaxytab/200/200' },
  { id: 'prod_iphone_15', name: 'iPhone 15 Pro', price: 999, image: 'https://picsum.photos/seed/iphone15/200/200' },
  { id: 'prod_pixel_8', name: 'Google Pixel 8 Pro', price: 899, image: 'https://picsum.photos/seed/pixel8/200/200' },
  { id: 'prod_apple_watch', name: 'Apple Watch Ultra 2', price: 799, image: 'https://picsum.photos/seed/applewatch/200/200' },
  { id: 'prod_galaxy_watch', name: 'Samsung Galaxy Watch 6', price: 399, image: 'https://picsum.photos/seed/galaxywatch/200/200' },
  { id: 'prod_sony_headphones', name: 'Sony WH-1000XM5 Headphones', price: 349, image: 'https://picsum.photos/seed/sonywh/200/200' },
  { id: 'prod_bose_headphones', name: 'Bose QuietComfort Ultra', price: 429, image: 'https://picsum.photos/seed/boseqc/200/200' },
  { id: 'prod_airpods_pro', name: 'Apple AirPods Pro (2nd Gen)', price: 249, image: 'https://picsum.photos/seed/airpodspro/200/200' },
  { id: 'prod_tv_lg_c3', name: 'LG 65" Class C3 Series OLED 4K TV', price: 1599, image: 'https://picsum.photos/seed/lgtvc3/200/200' },
  { id: 'prod_tv_samsung_qled', name: 'Samsung 75" Class QN90C Neo QLED 4K TV', price: 2199, image: 'https://picsum.photos/seed/samsungtv/200/200' },
  { id: 'prod_soundbar_sonos', name: 'Sonos Arc Soundbar', price: 899, image: 'https://picsum.photos/seed/sonosarc/200/200' },
  { id: 'prod_ps5', name: 'PlayStation 5 Console', price: 499, image: 'https://picsum.photos/seed/ps5/200/200' },
  { id: 'prod_xbox', name: 'Xbox Series X Console', price: 499, image: 'https://picsum.photos/seed/xbox/200/200' },
  { id: 'prod_switch', name: 'Nintendo Switch OLED', price: 349, image: 'https://picsum.photos/seed/switch/200/200' },
  { id: 'prod_gopro', name: 'GoPro HERO12 Black', price: 399, image: 'https://picsum.photos/seed/gopro/200/200' },

  // Home & Kitchen
  { id: 'prod_dyson_v15', name: 'Dyson V15 Detect Vacuum', price: 749, image: 'https://picsum.photos/seed/dysonv15/200/200' },
  { id: 'prod_instant_pot', name: 'Instant Pot Duo Plus', price: 129, image: 'https://picsum.photos/seed/instantpot/200/200' },
  { id: 'prod_air_fryer', name: 'Ninja AF101 Air Fryer', price: 99, image: 'https://picsum.photos/seed/airfryer/200/200' },
  { id: 'prod_nespresso', name: 'Nespresso VertuoPlus Coffee Maker', price: 199, image: 'https://picsum.photos/seed/nespresso/200/200' },
  { id: 'prod_kitchenaid_mixer', name: 'KitchenAid Artisan Stand Mixer', price: 449, image: 'https://picsum.photos/seed/kitchenaid/200/200' },
  { id: 'prod_blender_vitamix', name: 'Vitamix Explorian Blender', price: 349, image: 'https://picsum.photos/seed/vitamix/200/200' },
  { id: 'prod_robot_vacuum', name: 'iRobot Roomba j7+', price: 799, image: 'https://picsum.photos/seed/roomba/200/200' },
  { id: 'prod_thermostat_nest', name: 'Google Nest Learning Thermostat', price: 249, image: 'https://picsum.photos/seed/nest/200/200' },

  // Books
  { id: 'prod_book_atomichabits', name: 'Atomic Habits by James Clear', price: 27, image: 'https://picsum.photos/seed/atomichabits/200/200' },
  { id: 'prod_book_dune', name: 'Dune by Frank Herbert', price: 18, image: 'https://picsum.photos/seed/dune/200/200' },
  { id: 'prod_book_psychologyofmoney', name: 'The Psychology of Money', price: 20, image: 'https://picsum.photos/seed/psychmoney/200/200' },
  { id: 'prod_book_fourthwing', name: 'Fourth Wing by Rebecca Yarros', price: 29, image: 'https://picsum.photos/seed/fourthwing/200/200' },
  { id: 'prod_book_sapiens', name: 'Sapiens: A Brief History of Humankind', price: 25, image: 'https://picsum.photos/seed/sapiens/200/200' },

  // Apparel
  { id: 'prod_jacket_patagonia', name: 'Patagonia Nano Puff Jacket', price: 239, image: 'https://picsum.photos/seed/patagonia/200/200' },
  { id: 'prod_shoes_nike', name: 'Nike Air Force 1 \'07', price: 110, image: 'https://picsum.photos/seed/nikeaf1/200/200' },
  { id: 'prod_shoes_hoka', name: 'Hoka Clifton 9 Running Shoes', price: 145, image: 'https://picsum.photos/seed/hoka/200/200' },
  { id: 'prod_jeans_levis', name: 'Levi\'s 501 Original Fit Jeans', price: 79, image: 'https://picsum.photos/seed/levis/200/200' },
  { id: 'prod_sunglasses_rayban', name: 'Ray-Ban Classic Wayfarer', price: 161, image: 'https://picsum.photos/seed/rayban/200/200' },
];

export const searchProducts = (query: string): Product[] => {
    const lowerCaseQuery = query.toLowerCase();
    if (!lowerCaseQuery) return [];
    
    return MOCK_BESTBUY_PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery)
    );
};
