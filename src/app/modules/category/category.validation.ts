import z from "zod"

const createCategory = z.object({
    body: z.object({
        name: z.string("Name is required"),
        description: z.string("Description is required")
    })
})

export const CategoryValidation = {
    createCategory
}