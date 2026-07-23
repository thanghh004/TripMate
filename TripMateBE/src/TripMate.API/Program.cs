using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
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

// 2. Cấu hình DbContext với SQL Server
builder.Services.AddDbContext<TripMateDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// 5. Cấu hình CORS cho kết nối Frontend (Next.js)
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

app.UseHttpsRedirection();

// Phục vụ file tĩnh (ảnh upload) từ thư mục wwwroot
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
