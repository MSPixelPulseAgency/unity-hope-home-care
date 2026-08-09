export const services = [
  {
    slug: "personal-care",
    title: "Personal Care Assistance",
    shortTitle: "Personal Care",
    icon: "HeartHandshake",
    image: "/images/brochure-caregiver.webp",
    description: "Respectful help with bathing, dressing, grooming and mobility.",
    intro:
      "Personal care support is provided with patience, respect and close attention to each person's routines and preferences.",
    examples: ["Bathing assistance", "Dressing and grooming", "Mobility support", "Daily routine support"],
    note: "Non-medical support designed to protect dignity and encourage independence.",
  },
  {
    slug: "companionship",
    title: "Companionship",
    shortTitle: "Companionship",
    icon: "UsersRound",
    image: "/images/senior-couple.webp",
    description: "Meaningful conversation, friendly visits and emotional support.",
    intro:
      "A familiar, caring presence can bring connection, confidence and comfort to everyday life at home.",
    examples: ["Friendly visits", "Meaningful conversation", "Shared activities", "Social connection at home"],
  },
  {
    slug: "meal-preparation",
    title: "Meal Preparation",
    shortTitle: "Meal Preparation",
    icon: "CookingPot",
    image: "/images/family-cooking.webp",
    description: "Nutritious meals prepared with care and personal preferences in mind.",
    intro:
      "Meal preparation support helps make familiar routines easier while keeping the experience comfortable and enjoyable.",
    examples: ["Simple meal preparation", "Preference-aware planning", "Kitchen routine support", "Light meal clean-up"],
    note: "We do not provide medical nutrition advice or prescribe specialized diets.",
  },
  {
    slug: "light-housekeeping",
    title: "Light Housekeeping",
    shortTitle: "Light Housekeeping",
    icon: "House",
    image: "/images/caregiver-cleaning.webp",
    description: "Support for a clean, safe and comfortable home environment.",
    intro:
      "Light household help can make daily life more manageable and support a comfortable routine at home.",
    examples: ["Light tidying", "Laundry support", "Simple household routines", "Keeping common areas comfortable"],
    note: "This service is light household support, not commercial cleaning.",
  },
  {
    slug: "medication-reminders",
    title: "Medication Reminders",
    shortTitle: "Medication Reminders",
    icon: "BellRing",
    image: "/images/caregiver-attentive.webp",
    description: "Timely, non-medical reminders to help clients stay on track.",
    intro:
      "Caregivers can provide routine reminders while respecting the client's established medication schedule.",
    examples: ["Scheduled verbal reminders", "Routine awareness", "Family communication as arranged", "Non-medical support"],
    note: "Caregivers do not administer medication, manage prescriptions or provide medical advice.",
  },
  {
    slug: "respite-care",
    title: "Respite Care",
    shortTitle: "Respite Care",
    icon: "HeartPlus",
    image: "/images/holding-hands.webp",
    description: "Dependable support when family caregivers need time to rest or recharge.",
    intro:
      "Respite care gives family caregivers time for appointments, responsibilities or rest while their loved one has caring support.",
    examples: ["Short-term family relief", "Companionship at home", "Routine support", "Peace of mind for families"],
  },
  {
    slug: "errands",
    title: "Errands",
    shortTitle: "Errands",
    icon: "ShoppingBasket",
    image: "/images/kitchen-care.webp",
    description: "Help with grocery shopping, pharmacy pickups and other daily errands.",
    intro:
      "Practical errand support can make daily routines easier and help clients remain comfortable at home.",
    examples: ["Grocery shopping", "Pharmacy pickups", "Essential daily errands", "Routine household pickups"],
  },
];

export const getServiceBySlug = (slug) => services.find((service) => service.slug === slug);

