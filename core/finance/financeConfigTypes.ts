export interface FixedCost {
  id:        string
  projectId: string
  label:     string
  amount:    number
  createdAt?: string
}

export interface ProfitGoal {
  projectId:     string
  monthlyTarget: number
  updatedAt?:    string
}
