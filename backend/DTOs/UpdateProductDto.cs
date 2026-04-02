using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class UpdateProductDto
    {
        [Required(ErrorMessage = "Ürün adı zorunludur.")]
        [MinLength(2, ErrorMessage = "Ürün adı en az 2 karakter olmalıdır.")]
        [MaxLength(200, ErrorMessage = "Ürün adı en fazla 200 karakter olmalıdır.")]
        public string Name { get; set; } = string.Empty;
        [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olmalıdır.")]
        public string? Description { get; set; }
        [MaxLength(500, ErrorMessage = "Resim URL en fazla 500 karakter olmalıdır.")]
        public string? ImageUrl { get; set; }
        [Required(ErrorMessage = "Durum zorunludur.")]
        [ProductStatusValue]
        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }
}