using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("usuarios")]
    public class Usuario
    {
    [Column("id")]
    public int Id { get; set; }
    [Column("username")]
    public required string Username { get; set; }
    [Column("password_hash")]
    public required string PasswordHash { get; set; }
    [Column("nombre")]
    public required string Nombre { get; set; }
    [Column("creado_en")]
    public DateTime CreadoEn { get; set; }

    [Column("Rol")]
    public string Rol { get; set; } = "Usuario";
    }
}