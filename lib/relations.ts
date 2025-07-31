export interface Relation {
  id: string
  label: string
  hindi: string
  category: "parent" | "child" | "sibling" | "spouse" | "grandparent" | "grandchild" | "extended"
  gender?: "male" | "female"
}

export const RELATIONS: Relation[] = [
  // Parents
  { id: "mata", label: "Mother", hindi: "माता", category: "parent", gender: "female" },
  { id: "pita", label: "Father", hindi: "पिता", category: "parent", gender: "male" },

  // Children
  { id: "putra", label: "Son", hindi: "पुत्र", category: "child", gender: "male" },
  { id: "putri", label: "Daughter", hindi: "पुत्री", category: "child", gender: "female" },

  // Siblings
  { id: "bhai", label: "Brother", hindi: "भाई", category: "sibling", gender: "male" },
  { id: "bahan", label: "Sister", hindi: "बहन", category: "sibling", gender: "female" },

  // Spouse
  { id: "pati", label: "Husband", hindi: "पति", category: "spouse", gender: "male" },
  { id: "patni", label: "Wife", hindi: "पत्नी", category: "spouse", gender: "female" },

  // Grandparents
  { id: "dada", label: "Paternal Grandfather", hindi: "दादा", category: "grandparent", gender: "male" },
  { id: "dadi", label: "Paternal Grandmother", hindi: "दादी", category: "grandparent", gender: "female" },
  { id: "nana", label: "Maternal Grandfather", hindi: "नाना", category: "grandparent", gender: "male" },
  { id: "nani", label: "Maternal Grandmother", hindi: "नानी", category: "grandparent", gender: "female" },

  // Extended Family
  { id: "chacha", label: "Father's Brother", hindi: "चाचा", category: "extended", gender: "male" },
  { id: "chachi", label: "Father's Brother's Wife", hindi: "चाची", category: "extended", gender: "female" },
  { id: "mama", label: "Mother's Brother", hindi: "मामा", category: "extended", gender: "male" },
  { id: "mami", label: "Mother's Brother's Wife", hindi: "मामी", category: "extended", gender: "female" },
]

export const getRelationById = (id: string) => RELATIONS.find((r) => r.id === id)
export const getRelationsByCategory = (category: string) => RELATIONS.filter((r) => r.category === category)
