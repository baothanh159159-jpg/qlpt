using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quanlyphongtro.Data;
using Quanlyphongtro.Models.Entity;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<ApplicationDbContext>(option =>
    option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnecttion")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("JWT Key is not configured in appsettings.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine("Khong the cap nhat schema database. Hay kiem tra migration va cau truc bang Users.");
        Console.Error.WriteLine(ex.ToString());
        throw;
    }


    
    var adminUser = db.Users.FirstOrDefault(u => u.Role == "Admin");
    if (adminUser == null)
    {
        db.Users.Add(new User
        {
            Email = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
            Role = "Admin",
            IsActive = true,
            ApprovalStatus = "Approved",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
        Console.WriteLine("✅ Đã tạo tài khoản Admin: admin / admin");
    }
    else
    {
        
        adminUser.Email = "admin";
        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin");
        adminUser.Role = "Admin";
        adminUser.IsActive = true;
        adminUser.ApprovalStatus = "Approved";
        db.SaveChanges();
        Console.WriteLine("✅ Đã cập nhật tài khoản Admin thành: admin / admin");
    }
}


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
