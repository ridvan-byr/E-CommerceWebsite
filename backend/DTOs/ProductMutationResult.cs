namespace backend.DTOs;

public enum ProductMutationError
{
    None = 0,
    DuplicateSku = 1,
    DuplicateBarcode = 2,
    InvalidCategory = 3,
    NotFound = 4,
}

public readonly record struct ProductMutationResult(ProductResponseDto? Product, ProductMutationError Error);
