using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TripMate.API.Middleware;
using TripMate.Application;
using TripMate.Domain.Entities;
using TripMate.Infrastructure;
using TripMate.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký dịch vụ cho các lớp (Clean Architecture Layers)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Cấu hình DbContext với PostgreSQL
builder.Services.AddDbContext<TripMateDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Cấu hình ASP.NET Core Identity
builder.Services.AddIdentityCore<User>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddRoles<IdentityRole<Guid>>()
.AddEntityFrameworkStores<TripMateDbContext>()
.AddDefaultTokenProviders();

// 4. Cấu hình JWT Bearer Authentication
var secretKey = builder.Configuration["JwtSettings:Secret"] 
                ?? "TripMate_Super_Secret_Key_For_Jwt_Token_Generation_2026_Must_Be_Long_Enough";
var issuer = builder.Configuration["JwtSettings:Issuer"] ?? "TripMateApi";
var audience = builder.Configuration["JwtSettings:Audience"] ?? "TripMateClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5a. Cấu hình ForwardedHeaders — Đọc IP thực của client khi đứng sau Nginx/Cloudflare/Load Balancer
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Cho phép tất cả proxy (production nên giới hạn KnownProxies cụ thể)
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// 5b. Cấu hình Rate Limiting — Chống Brute-force & DDoS cho các endpoint Auth
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Policy "AuthPolicy": Tối đa 5 request/phút trên mỗi IP — SlidingWindow mịn hơn FixedWindow
    // Tránh "double hit": cuối cửa sổ cũ + đầu cửa sổ mới gửi dồn 10 request trong 2 giây
    options.AddPolicy("AuthPolicy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6, // Chia thành 6 đoạn = mỗi đoạn 10 giây
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Policy "GeneralPolicy": Tối đa 60 request/phút cho các API thông thường
    options.AddPolicy("GeneralPolicy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));
});

// 6. Cấu hình CORS cho kết nối Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 6. Đăng ký Controllers & Swagger/OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 7. Cấu hình giới hạn kích thước file upload (tối đa 10MB)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Bắt lỗi toàn cục tự động chuyển thành JSON phản hồi chuẩn
app.UseMiddleware<ExceptionMiddleware>();

// Đọc IP thực của client từ header X-Forwarded-For (khi đứng sau Nginx/Cloudflare)
app.UseForwardedHeaders();

app.UseHttpsRedirection();

// Phục vụ file tĩnh (ảnh upload) từ thư mục wwwroot
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseRateLimiter();

app.UseAuthentication();
app.UseMiddleware<UserStatusMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
