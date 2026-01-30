import { z } from "zod";

export type ActionState<T> = {
    fieldErrors?: Record<string, string[] | undefined>;
    error?: string;
    data?: T;
    success?: boolean;
};

/**
 * Creates a "safe" server action that validates input data against a Zod schema
 * before executing the handler function.
 * 
 * @param schema - The Zod schema to validate the input data against
 * @param handler - The actual server action function to execute if validation passes
 * @returns A function that takes the input data and returns a standard ActionState
 */
export const createSafeAction = <TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (validatedData: TInput) => Promise<ActionState<TOutput>>
) => {
    return async (data: TInput): Promise<ActionState<TOutput>> => {
        // 1. Validate Input
        const validationResult = schema.safeParse(data);

        if (!validationResult.success) {
            return {
                fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
                error: "Validation Error: Please check your inputs.",
                success: false
            };
        }

        // 2. Execute Handler safely
        try {
            return await handler(validationResult.data);
        } catch (error) {
            console.error("Server Action Error:", error);
            return {
                error: "An unexpected error occurred. Please try again.",
                success: false
            };
        }
    };
};
