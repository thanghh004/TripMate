using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using ValidationException = TripMate.Domain.Exceptions.ValidationException;

namespace TripMate.Application.Common.Behaviours;

/// <summary>
/// Pipeline Behavior của MediatR để tự động bắt lỗi đầu vào bằng FluentValidation và ném ra Custom ValidationException
/// </summary>
public class ValidationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken cancellationToken)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);

            // Chạy bất tuần tự toàn bộ các Validator tương ứng với Request
            var validationResults = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            // Lấy ra danh sách các lỗi
            var failures = validationResults
                .Where(r => r.Errors.Any())
                .SelectMany(r => r.Errors)
                .ToList();

            if (failures.Any())
            {
                // Nhóm các lỗi theo tên trường và gom thông tin thành từ điển lỗi
                var errors = failures
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );

                // Ném ra ngoại lệ Custom ValidationException của lớp Domain
                throw new ValidationException(errors);
            }
        }

        // Đi tiếp tới Handler tiếp theo nếu không có lỗi
        return await next();
    }
}
