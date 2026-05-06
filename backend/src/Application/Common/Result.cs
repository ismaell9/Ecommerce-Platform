namespace Application.Common;

public class Result<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public Dictionary<string, string[]> Errors { get; set; } = new();

    public static Result<T> SuccessResult(T data, string message = "")
        => new() { Success = true, Data = data, Message = message };

    public static Result<T> FailureResult(string message)
        => new() { Success = false, Message = message };

    public static Result<T> FailureResult(Dictionary<string, string[]> errors)
        => new() { Success = false, Errors = errors, Message = "Validation failed" };
}

public class Result
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, string[]> Errors { get; set; } = new();

    public static Result SuccessResult(string message = "")
        => new() { Success = true, Message = message };

    public static Result FailureResult(string message)
        => new() { Success = false, Message = message };

    public static Result FailureResult(Dictionary<string, string[]> errors)
        => new() { Success = false, Errors = errors, Message = "Validation failed" };
}
