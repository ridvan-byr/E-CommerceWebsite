namespace backend.DTOs
{
    public class ProductPriceResponseDto
    {
        public int ProductPriceId { get; set; }
        public int ProductId { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public bool IsDiscount { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}