namespace backend.DTOs;


public class UpdateCategoryDto
{
    public string Name {get; set;} = string.Empty;
    public string? Description{get; set;}
    public string? ImageUrl { get; set; }

}