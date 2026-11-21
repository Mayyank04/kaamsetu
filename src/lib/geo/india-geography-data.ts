/**
 * KAAMSETU — Complete India Geographic Reference System
 * Authoritative dataset covering all 28 States and 8 Union Territories (36 total).
 * Aligned with Local Government Directory (LGD), Census of India, and India Post Postal Index Number (PIN) system.
 */

export interface IndiaState {
  code: string; // ISO 3166-2:IN code (e.g. "AS", "ML", "DL", "MH")
  name: string; // Official English Name
  hindiName: string; // Official Devanagari / Hindi Name
  type: "state" | "union_territory";
  zone: "North" | "South" | "East" | "West" | "Central" | "North East";
  isUnionTerritory?: boolean;
  capital?: string;
  pinPrefixes: string[]; // Valid 2-digit PIN code prefixes
  pincodePrefixes?: string[];
  districts: string[]; // Full list of revenue districts
  majorHubs: {
    city: string;
    hindiName?: string;
    district: string;
    tier: 1 | 2 | 3;
    isCapital?: boolean;
    aliases?: string[];
  }[];
}

export const INDIA_STATES_DATA: IndiaState[] = [
  // ================= 28 STATES =================
  {
    code: "AP",
    name: "Andhra Pradesh",
    hindiName: "आंध्र प्रदेश",
    type: "state",
    zone: "South",
    pinPrefixes: ["51", "52", "53"],
    districts: [
      "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla",
      "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur",
      "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu",
      "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai",
      "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR"
    ],
    majorHubs: [
      { city: "Visakhapatnam", district: "Visakhapatnam", tier: 2, aliases: ["Vizag", "Waltair"] },
      { city: "Vijayawada", district: "NTR", tier: 2, aliases: ["Bezawada"] },
      { city: "Guntur", district: "Guntur", tier: 2 },
      { city: "Nellore", district: "Sri Potti Sriramulu Nellore", tier: 3 },
      { city: "Kurnool", district: "Kurnool", tier: 3 },
      { city: "Tirupati", district: "Tirupati", tier: 3 },
      { city: "Amaravati", district: "Guntur", tier: 3, isCapital: true },
    ],
  },
  {
    code: "AR",
    name: "Arunachal Pradesh",
    hindiName: "अरुणाचल प्रदेश",
    type: "state",
    zone: "North East",
    pinPrefixes: ["79"],
    districts: [
      "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang",
      "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit",
      "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai",
      "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang",
      "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
    ],
    majorHubs: [
      { city: "Itanagar", district: "Papum Pare", tier: 3, isCapital: true },
      { city: "Naharlagun", district: "Papum Pare", tier: 3 },
      { city: "Pasighat", district: "East Siang", tier: 3 },
      { city: "Tawang", district: "Tawang", tier: 3 },
    ],
  },
  {
    code: "AS",
    name: "Assam",
    hindiName: "असम",
    type: "state",
    zone: "North East",
    pinPrefixes: ["78"],
    districts: [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
      "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao",
      "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup",
      "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur",
      "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur",
      "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"
    ],
    majorHubs: [
      { city: "Guwahati", district: "Kamrup Metropolitan", tier: 2, aliases: ["Gauhati"] },
      { city: "Dispur", district: "Kamrup Metropolitan", tier: 3, isCapital: true },
      { city: "Dibrugarh", district: "Dibrugarh", tier: 3 },
      { city: "Silchar", district: "Cachar", tier: 3 },
      { city: "Jorhat", district: "Jorhat", tier: 3 },
      { city: "Nagaon", district: "Nagaon", tier: 3 },
      { city: "Tezpur", district: "Sonitpur", tier: 3 },
      { city: "Tinsukia", district: "Tinsukia", tier: 3 },
    ],
  },
  {
    code: "BR",
    name: "Bihar",
    hindiName: "बिहार",
    type: "state",
    zone: "East",
    pinPrefixes: ["80", "81", "82", "84", "85"],
    districts: [
      "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur",
      "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj",
      "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj",
      "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda",
      "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur",
      "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
      "Vaishali", "West Champaran"
    ],
    majorHubs: [
      { city: "Patna", district: "Patna", tier: 2, isCapital: true, aliases: ["Pataliputra"] },
      { city: "Gaya", district: "Gaya", tier: 3 },
      { city: "Bhagalpur", district: "Bhagalpur", tier: 3 },
      { city: "Muzaffarpur", district: "Muzaffarpur", tier: 3 },
      { city: "Darbhanga", district: "Darbhanga", tier: 3 },
      { city: "Purnia", district: "Purnia", tier: 3 },
      { city: "Begusarai", district: "Begusarai", tier: 3 },
    ],
  },
  {
    code: "CG",
    name: "Chhattisgarh",
    hindiName: "छत्तीसगढ़",
    type: "state",
    zone: "Central",
    pinPrefixes: ["49"],
    districts: [
      "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur",
      "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela Pendra Marwahi",
      "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai",
      "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur",
      "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur",
      "Rajnandgaon", "Sarangarh-Bilaigarh", "Sakti", "Sukma", "Surajpur", "Surguja"
    ],
    majorHubs: [
      { city: "Raipur", district: "Raipur", tier: 2, isCapital: true },
      { city: "Bhilai", district: "Durg", tier: 3, aliases: ["Bhilai Nagar"] },
      { city: "Bilaspur", district: "Bilaspur", tier: 3 },
      { city: "Korba", district: "Korba", tier: 3 },
      { city: "Durg", district: "Durg", tier: 3 },
    ],
  },
  {
    code: "GA",
    name: "Goa",
    hindiName: "गोवा",
    type: "state",
    zone: "West",
    pinPrefixes: ["403"],
    districts: ["North Goa", "South Goa"],
    majorHubs: [
      { city: "Panaji", district: "North Goa", tier: 3, isCapital: true, aliases: ["Panjim"] },
      { city: "Margao", district: "South Goa", tier: 3, aliases: ["Madgaon"] },
      { city: "Vasco da Gama", district: "South Goa", tier: 3, aliases: ["Vasco"] },
      { city: "Mapusa", district: "North Goa", tier: 3 },
    ],
  },
  {
    code: "GJ",
    name: "Gujarat",
    hindiName: "गुजरात",
    type: "state",
    zone: "West",
    pinPrefixes: ["36", "37", "38", "39"],
    districts: [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch",
      "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka",
      "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch",
      "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal",
      "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar",
      "Tapi", "Vadodara", "Valsad"
    ],
    majorHubs: [
      { city: "Ahmedabad", district: "Ahmedabad", tier: 1, aliases: ["Amdavad"] },
      { city: "Surat", district: "Surat", tier: 2 },
      { city: "Vadodara", district: "Vadodara", tier: 2, aliases: ["Baroda"] },
      { city: "Rajkot", district: "Rajkot", tier: 2 },
      { city: "Gandhinagar", district: "Gandhinagar", tier: 3, isCapital: true },
      { city: "Bhavnagar", district: "Bhavnagar", tier: 3 },
      { city: "Jamnagar", district: "Jamnagar", tier: 3 },
    ],
  },
  {
    code: "HR",
    name: "Haryana",
    hindiName: "हरियाणा",
    type: "state",
    zone: "North",
    pinPrefixes: ["12", "13"],
    districts: [
      "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram",
      "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra",
      "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari",
      "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
    ],
    majorHubs: [
      { city: "Gurugram", district: "Gurugram", tier: 2, aliases: ["Gurgaon"] },
      { city: "Faridabad", district: "Faridabad", tier: 2 },
      { city: "Panipat", district: "Panipat", tier: 3 },
      { city: "Ambala", district: "Ambala", tier: 3 },
      { city: "Karnal", district: "Karnal", tier: 3 },
      { city: "Rohtak", district: "Rohtak", tier: 3 },
      { city: "Hisar", district: "Hisar", tier: 3 },
      { city: "Chandigarh", district: "Panchkula", tier: 2, isCapital: true },
    ],
  },
  {
    code: "HP",
    name: "Himachal Pradesh",
    hindiName: "हिमाचल प्रदेश",
    type: "state",
    zone: "North",
    pinPrefixes: ["17"],
    districts: [
      "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu",
      "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
    ],
    majorHubs: [
      { city: "Shimla", district: "Shimla", tier: 3, isCapital: true, aliases: ["Simla"] },
      { city: "Dharamshala", district: "Kangra", tier: 3 },
      { city: "Solan", district: "Solan", tier: 3 },
      { city: "Mandi", district: "Mandi", tier: 3 },
      { city: "Kullu", district: "Kullu", tier: 3 },
    ],
  },
  {
    code: "JH",
    name: "Jharkhand",
    hindiName: "झारखंड",
    type: "state",
    zone: "East",
    pinPrefixes: ["81", "82", "83"],
    districts: [
      "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum",
      "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara",
      "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu",
      "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"
    ],
    majorHubs: [
      { city: "Ranchi", district: "Ranchi", tier: 2, isCapital: true },
      { city: "Jamshedpur", district: "East Singhbhum", tier: 2, aliases: ["Tatanagar"] },
      { city: "Dhanbad", district: "Dhanbad", tier: 3 },
      { city: "Bokaro Steel City", district: "Bokaro", tier: 3 },
      { city: "Deoghar", district: "Deoghar", tier: 3 },
    ],
  },
  {
    code: "KA",
    name: "Karnataka",
    hindiName: "कर्नाटक",
    type: "state",
    zone: "South",
    pinPrefixes: ["56", "57", "58", "59"],
    districts: [
      "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
      "Bidar", "Chamarajanagara", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
      "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
      "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
      "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
      "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"
    ],
    majorHubs: [
      { city: "Bengaluru", district: "Bengaluru Urban", tier: 1, isCapital: true, aliases: ["Bangalore"] },
      { city: "Mysuru", district: "Mysuru", tier: 2, aliases: ["Mysore"] },
      { city: "Hubballi", district: "Dharwad", tier: 2, aliases: ["Hubli"] },
      { city: "Mangaluru", district: "Dakshina Kannada", tier: 2, aliases: ["Mangalore"] },
      { city: "Belagavi", district: "Belagavi", tier: 3, aliases: ["Belgaum"] },
      { city: "Kalaburagi", district: "Kalaburagi", tier: 3, aliases: ["Gulbarga"] },
      { city: "Shivamogga", district: "Shivamogga", tier: 3, aliases: ["Shimoga"] },
    ],
  },
  {
    code: "KL",
    name: "Kerala",
    hindiName: "केरल",
    type: "state",
    zone: "South",
    pinPrefixes: ["67", "68", "69"],
    districts: [
      "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
      "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
      "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
    ],
    majorHubs: [
      { city: "Thiruvananthapuram", district: "Thiruvananthapuram", tier: 2, isCapital: true, aliases: ["Trivandrum"] },
      { city: "Kochi", district: "Ernakulam", tier: 2, aliases: ["Cochin", "Ernakulam"] },
      { city: "Kozhikode", district: "Kozhikode", tier: 2, aliases: ["Calicut"] },
      { city: "Thrissur", district: "Thrissur", tier: 3, aliases: ["Trichur"] },
      { city: "Kollam", district: "Kollam", tier: 3, aliases: ["Quilon"] },
      { city: "Kannur", district: "Kannur", tier: 3, aliases: ["Cannanore"] },
    ],
  },
  {
    code: "MP",
    name: "Madhya Pradesh",
    hindiName: "मध्य प्रदेश",
    type: "state",
    zone: "Central",
    pinPrefixes: ["45", "46", "47", "48"],
    districts: [
      "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani",
      "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara",
      "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna",
      "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua",
      "Katni", "Khandwa", "Khargone", "Maihar", "Mandla", "Mandsaur",
      "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Pandhurna",
      "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna",
      "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri",
      "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
    ],
    majorHubs: [
      { city: "Indore", district: "Indore", tier: 2 },
      { city: "Bhopal", district: "Bhopal", tier: 2, isCapital: true },
      { city: "Jabalpur", district: "Jabalpur", tier: 3 },
      { city: "Gwalior", district: "Gwalior", tier: 3 },
      { city: "Ujjain", district: "Ujjain", tier: 3 },
      { city: "Sagar", district: "Sagar", tier: 3 },
    ],
  },
  {
    code: "MH",
    name: "Maharashtra",
    hindiName: "महाराष्ट्र",
    type: "state",
    zone: "West",
    pinPrefixes: ["40", "41", "42", "43", "44"],
    districts: [
      "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhajinagar", "Beed",
      "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli",
      "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
      "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
      "Nandurbar", "Nashik", "Dharashiv", "Palghar", "Parbhani",
      "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
      "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ],
    majorHubs: [
      { city: "Mumbai", district: "Mumbai City", tier: 1, isCapital: true, aliases: ["Bombay"] },
      { city: "Pune", district: "Pune", tier: 1, aliases: ["Poona"] },
      { city: "Nagpur", district: "Nagpur", tier: 2 },
      { city: "Thane", district: "Thane", tier: 2 },
      { city: "Nashik", district: "Nashik", tier: 2, aliases: ["Nasik"] },
      { city: "Chhatrapati Sambhajinagar", district: "Chhatrapati Sambhajinagar", tier: 2, aliases: ["Aurangabad"] },
      { city: "Navi Mumbai", district: "Thane", tier: 2 },
      { city: "Kolhapur", district: "Kolhapur", tier: 3 },
      { city: "Solapur", district: "Solapur", tier: 3 },
    ],
  },
  {
    code: "MN",
    name: "Manipur",
    hindiName: "मणिपुर",
    type: "state",
    zone: "North East",
    pinPrefixes: ["79"],
    districts: [
      "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West",
      "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney",
      "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
    ],
    majorHubs: [
      { city: "Imphal", district: "Imphal West", tier: 3, isCapital: true },
      { city: "Churachandpur", district: "Churachandpur", tier: 3 },
      { city: "Thoubal", district: "Thoubal", tier: 3 },
    ],
  },
  {
    code: "ML",
    name: "Meghalaya",
    hindiName: "मेघालय",
    type: "state",
    zone: "North East",
    pinPrefixes: ["79"],
    districts: [
      "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills",
      "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills",
      "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
    ],
    majorHubs: [
      { city: "Shillong", district: "East Khasi Hills", tier: 3, isCapital: true },
      { city: "Tura", district: "West Garo Hills", tier: 3 },
      { city: "Jowai", district: "West Jaintia Hills", tier: 3 },
      { city: "Nongpoh", district: "Ri Bhoi", tier: 3 },
    ],
  },
  {
    code: "MZ",
    name: "Mizoram",
    hindiName: "मिज़ोरम",
    type: "state",
    zone: "North East",
    pinPrefixes: ["79"],
    districts: [
      "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib",
      "Lawngtlai", "Lunglei", "Mamit", "Saitual", "Serchhip", "Siaha"
    ],
    majorHubs: [
      { city: "Aizawl", district: "Aizawl", tier: 3, isCapital: true },
      { city: "Lunglei", district: "Lunglei", tier: 3 },
      { city: "Champhai", district: "Champhai", tier: 3 },
    ],
  },
  {
    code: "NL",
    name: "Nagaland",
    hindiName: "नागालैंड",
    type: "state",
    zone: "North East",
    pinPrefixes: ["79"],
    districts: [
      "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng",
      "Mokokchung", "Mon", "Niuland", "Noklak", "Peren",
      "Phek", "Shamator", "Tseminyü", "Tuensang", "Wokha", "Zünheboto"
    ],
    majorHubs: [
      { city: "Dimapur", district: "Dimapur", tier: 3 },
      { city: "Kohima", district: "Kohima", tier: 3, isCapital: true },
      { city: "Mokokchung", district: "Mokokchung", tier: 3 },
    ],
  },
  {
    code: "OD",
    name: "Odisha",
    hindiName: "ओडिशा",
    type: "state",
    zone: "East",
    pinPrefixes: ["75", "76", "77"],
    districts: [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
      "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
      "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar",
      "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
      "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    ],
    majorHubs: [
      { city: "Bhubaneswar", district: "Khordha", tier: 2, isCapital: true },
      { city: "Cuttack", district: "Cuttack", tier: 2 },
      { city: "Rourkela", district: "Sundargarh", tier: 3 },
      { city: "Berhampur", district: "Ganjam", tier: 3, aliases: ["Brahmapur"] },
      { city: "Sambalpur", district: "Sambalpur", tier: 3 },
      { city: "Puri", district: "Puri", tier: 3 },
    ],
  },
  {
    code: "PB",
    name: "Punjab",
    hindiName: "पंजाब",
    type: "state",
    zone: "North",
    pinPrefixes: ["14", "15", "16"],
    districts: [
      "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
      "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar",
      "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga",
      "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar",
      "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"
    ],
    majorHubs: [
      { city: "Ludhiana", district: "Ludhiana", tier: 2 },
      { city: "Amritsar", district: "Amritsar", tier: 2 },
      { city: "Jalandhar", district: "Jalandhar", tier: 2 },
      { city: "Patiala", district: "Patiala", tier: 3 },
      { city: "Bathinda", district: "Bathinda", tier: 3 },
      { city: "Mohali", district: "Sahibzada Ajit Singh Nagar", tier: 2, aliases: ["SAS Nagar"] },
      { city: "Chandigarh", district: "Rupnagar", tier: 2, isCapital: true },
    ],
  },
  {
    code: "RJ",
    name: "Rajasthan",
    hindiName: "राजस्थान",
    type: "state",
    zone: "North",
    pinPrefixes: ["30", "31", "32", "33", "34"],
    districts: [
      "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran",
      "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi",
      "Chittorgarh", "Churu", "Dausa", "Deeg", "Dholpur", "Didwana-Kuchaman",
      "Dudu", "Dungarpur", "Ganganagar", "Gangapurcity", "Hanumangarh", "Jaipur",
      "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur",
      "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", "Kota", "Kotputli-Behror",
      "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh", "Rajsamand",
      "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi",
      "Tonk", "Udaipur"
    ],
    majorHubs: [
      { city: "Jaipur", district: "Jaipur", tier: 1, isCapital: true },
      { city: "Jodhpur", district: "Jodhpur", tier: 2 },
      { city: "Kota", district: "Kota", tier: 2 },
      { city: "Bikaner", district: "Bikaner", tier: 3 },
      { city: "Ajmer", district: "Ajmer", tier: 3 },
      { city: "Udaipur", district: "Udaipur", tier: 3 },
      { city: "Alwar", district: "Alwar", tier: 3 },
      { city: "Bhilwara", district: "Bhilwara", tier: 3 },
    ],
  },
  {
    code: "SK",
    name: "Sikkim",
    hindiName: "सिक्किम",
    type: "state",
    zone: "North East",
    pinPrefixes: ["73"],
    districts: ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"],
    majorHubs: [
      { city: "Gangtok", district: "Gangtok", tier: 3, isCapital: true },
      { city: "Namchi", district: "Namchi", tier: 3 },
    ],
  },
  {
    code: "TN",
    name: "Tamil Nadu",
    hindiName: "तमिलनाडु",
    type: "state",
    zone: "South",
    pinPrefixes: ["60", "61", "62", "63", "64"],
    districts: [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
      "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
      "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
      "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
      "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
      "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
      "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
      "Vellore", "Viluppuram", "Virudhunagar"
    ],
    majorHubs: [
      { city: "Chennai", district: "Chennai", tier: 1, isCapital: true, aliases: ["Madras"] },
      { city: "Coimbatore", district: "Coimbatore", tier: 2, aliases: ["Kovai"] },
      { city: "Madurai", district: "Madurai", tier: 2 },
      { city: "Tiruchirappalli", district: "Tiruchirappalli", tier: 2, aliases: ["Trichy"] },
      { city: "Salem", district: "Salem", tier: 3 },
      { city: "Tiruppur", district: "Tiruppur", tier: 3 },
      { city: "Erode", district: "Erode", tier: 3 },
      { city: "Vellore", district: "Vellore", tier: 3 },
    ],
  },
  {
    code: "TG",
    name: "Telangana",
    hindiName: "तेलंगाना",
    type: "state",
    zone: "South",
    pinPrefixes: ["50"],
    districts: [
      "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
      "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
      "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial",
      "Medak", "Medchal Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda",
      "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla",
      "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad",
      "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ],
    majorHubs: [
      { city: "Hyderabad", district: "Hyderabad", tier: 1, isCapital: true, aliases: ["Secunderabad"] },
      { city: "Warangal", district: "Warangal", tier: 2, aliases: ["Hanamkonda"] },
      { city: "Nizamabad", district: "Nizamabad", tier: 3 },
      { city: "Karimnagar", district: "Karimnagar", tier: 3 },
      { city: "Khammam", district: "Khammam", tier: 3 },
    ],
  },
  {
    code: "TR",
    name: "Tripura",
    hindiName: "त्रिपुरा",
    type: "state",
    zone: "North East",
    pinPrefixes: ["79"],
    districts: [
      "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala",
      "South Tripura", "Unakoti", "West Tripura"
    ],
    majorHubs: [
      { city: "Agartala", district: "West Tripura", tier: 3, isCapital: true },
      { city: "Dharmanagar", district: "North Tripura", tier: 3 },
      { city: "Udaipur", district: "Gomati", tier: 3 },
    ],
  },
  {
    code: "UP",
    name: "Uttar Pradesh",
    hindiName: "उत्तर प्रदेश",
    type: "state",
    zone: "North",
    pinPrefixes: ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
    districts: [
      "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya",
      "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur",
      "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor",
      "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah",
      "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad",
      "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi",
      "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat",
      "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur",
      "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau",
      "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh",
      "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar",
      "Shahjahanpur", "Shamli", "Shrawasti", "Siddharthnagar", "Sitapur", "Sonbhadra",
      "Sultanpur", "Unnao", "Varanasi"
    ],
    majorHubs: [
      { city: "Lucknow", district: "Lucknow", tier: 2, isCapital: true },
      { city: "Kanpur", district: "Kanpur Nagar", tier: 2, aliases: ["Cawnpore"] },
      { city: "Noida", district: "Gautam Buddha Nagar", tier: 2 },
      { city: "Ghaziabad", district: "Ghaziabad", tier: 2 },
      { city: "Varanasi", district: "Varanasi", tier: 2, aliases: ["Banaras", "Kashi"] },
      { city: "Prayagraj", district: "Prayagraj", tier: 2, aliases: ["Allahabad"] },
      { city: "Agra", district: "Agra", tier: 2 },
      { city: "Meerut", district: "Meerut", tier: 2 },
      { city: "Bareilly", district: "Bareilly", tier: 3 },
      { city: "Aligarh", district: "Aligarh", tier: 3 },
      { city: "Gorakhpur", district: "Gorakhpur", tier: 3 },
    ],
  },
  {
    code: "UK",
    name: "Uttarakhand",
    hindiName: "उत्तराखंड",
    type: "state",
    zone: "North",
    pinPrefixes: ["24", "26"],
    districts: [
      "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
      "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
      "Udham Singh Nagar", "Uttarkashi"
    ],
    majorHubs: [
      { city: "Dehradun", district: "Dehradun", tier: 2, isCapital: true },
      { city: "Haridwar", district: "Haridwar", tier: 3 },
      { city: "Roorkee", district: "Haridwar", tier: 3 },
      { city: "Haldwani", district: "Nainital", tier: 3 },
      { city: "Rishikesh", district: "Dehradun", tier: 3 },
    ],
  },
  {
    code: "WB",
    name: "West Bengal",
    hindiName: "पश्चिम बंगाल",
    type: "state",
    zone: "East",
    pinPrefixes: ["70", "71", "72", "73", "74"],
    districts: [
      "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
      "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram",
      "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia",
      "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
      "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ],
    majorHubs: [
      { city: "Kolkata", district: "Kolkata", tier: 1, isCapital: true, aliases: ["Calcutta"] },
      { city: "Howrah", district: "Howrah", tier: 2 },
      { city: "Siliguri", district: "Darjeeling", tier: 3 },
      { city: "Durgapur", district: "Paschim Bardhaman", tier: 3 },
      { city: "Asansol", district: "Paschim Bardhaman", tier: 3 },
      { city: "Kharagpur", district: "Paschim Medinipur", tier: 3 },
    ],
  },

  // ================= 8 UNION TERRITORIES =================
  {
    code: "AN",
    name: "Andaman and Nicobar Islands",
    hindiName: "अंडमान और निकोबार द्वीप समूह",
    type: "union_territory",
    zone: "East",
    pinPrefixes: ["74"],
    districts: ["Nicobar", "North and Middle Andaman", "South Andaman"],
    majorHubs: [
      { city: "Port Blair", district: "South Andaman", tier: 3, isCapital: true, aliases: ["Sri Vijaya Puram"] }
    ],
  },
  {
    code: "CH",
    name: "Chandigarh",
    hindiName: "चंडीगढ़",
    type: "union_territory",
    zone: "North",
    pinPrefixes: ["16"],
    districts: ["Chandigarh"],
    majorHubs: [
      { city: "Chandigarh", district: "Chandigarh", tier: 2, isCapital: true }
    ],
  },
  {
    code: "DH",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    hindiName: "दादरा और नगर हवेली और दमन और दीव",
    type: "union_territory",
    zone: "West",
    pinPrefixes: ["36", "39"],
    districts: ["Daman", "Diu", "Dadra and Nagar Haveli"],
    majorHubs: [
      { city: "Daman", district: "Daman", tier: 3, isCapital: true },
      { city: "Silvassa", district: "Dadra and Nagar Haveli", tier: 3 }
    ],
  },
  {
    code: "DL",
    name: "Delhi",
    hindiName: "दिल्ली",
    type: "union_territory",
    zone: "North",
    pinPrefixes: ["11"],
    districts: [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
      "North West Delhi", "Shahdara", "South Delhi", "South East Delhi",
      "South West Delhi", "West Delhi"
    ],
    majorHubs: [
      { city: "New Delhi", district: "New Delhi", tier: 1, isCapital: true, aliases: ["Delhi", "NCR"] }
    ],
  },
  {
    code: "JK",
    name: "Jammu and Kashmir",
    hindiName: "जम्मू और कश्मीर",
    type: "union_territory",
    zone: "North",
    pinPrefixes: ["18", "19"],
    districts: [
      "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal",
      "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch",
      "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian",
      "Srinagar", "Udhampur"
    ],
    majorHubs: [
      { city: "Srinagar", district: "Srinagar", tier: 2, isCapital: true },
      { city: "Jammu", district: "Jammu", tier: 2 }
    ],
  },
  {
    code: "LA",
    name: "Ladakh",
    hindiName: "लद्दाख",
    type: "union_territory",
    zone: "North",
    pinPrefixes: ["19"],
    districts: ["Kargil", "Leh"],
    majorHubs: [
      { city: "Leh", district: "Leh", tier: 3, isCapital: true },
      { city: "Kargil", district: "Kargil", tier: 3 }
    ],
  },
  {
    code: "LD",
    name: "Lakshadweep",
    hindiName: "लक्षद्वीप",
    type: "union_territory",
    zone: "South",
    pinPrefixes: ["68"],
    districts: ["Lakshadweep"],
    majorHubs: [
      { city: "Kavaratti", district: "Lakshadweep", tier: 3, isCapital: true }
    ],
  },
  {
    code: "PY",
    name: "Puducherry",
    hindiName: "पुदुचेरी",
    type: "union_territory",
    zone: "South",
    pinPrefixes: ["60"],
    districts: ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    majorHubs: [
      { city: "Puducherry", district: "Puducherry", tier: 3, isCapital: true, aliases: ["Pondicherry"] }
    ],
  },
];

/**
 * Common Alternate Spellings & Transliteration Aliases for Indian Cities
 */
export const CITY_ALIASES_MAP: Record<string, string> = {
  bangalore: "Bengaluru",
  bombay: "Mumbai",
  calcutta: "Kolkata",
  madras: "Chennai",
  gurgaon: "Gurugram",
  allahabad: "Prayagraj",
  pondicherry: "Puducherry",
  gauhati: "Guwahati",
  poona: "Pune",
  baroda: "Vadodara",
  cochin: "Kochi",
  trivandrum: "Thiruvananthapuram",
  calicut: "Kozhikode",
  trichy: "Tiruchirappalli",
  mysore: "Mysuru",
  hubli: "Hubballi",
  mangalore: "Mangaluru",
  belgaum: "Belagavi",
  shimoga: "Shivamogga",
  gulbarga: "Kalaburagi",
  banaras: "Varanasi",
  cawnpore: "Kanpur",
  vizag: "Visakhapatnam",
  simla: "Shimla",
};
