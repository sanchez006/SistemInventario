using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("equipos")]
    public class Equipo
    {
    [Column("id")]
    public int Id { get; set; }
    [Column("nombre")]
    public required string Nombre { get; set; }
    [Column("ciudad")]
    public required string Ciudad { get; set; }
    [Column("logo")]
    public required string Logo { get; set; }
    [Column("creado_en")]
    public DateTime CreadoEn { get; set; }
    }
}