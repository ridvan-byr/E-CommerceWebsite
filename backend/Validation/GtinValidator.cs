namespace backend.Validation;

public static class GtinValidator
{
    public static bool IsValidOrEmpty(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return true;

        var s = value.Trim();
        if (s.Length is not (8 or 12 or 13 or 14))
            return false;

        foreach (var c in s)
        {
            if (!char.IsDigit(c))
                return false;
        }

        return HasValidCheckDigit(s);
    }

    private static bool HasValidCheckDigit(string s)
    {
        var sum = 0;
        var multiplyThree = true;
        for (var i = s.Length - 2; i >= 0; i--)
        {
            var d = s[i] - '0';
            sum += multiplyThree ? d * 3 : d;
            multiplyThree = !multiplyThree;
        }

        var check = (10 - sum % 10) % 10;
        return check == s[^1] - '0';
    }
}
