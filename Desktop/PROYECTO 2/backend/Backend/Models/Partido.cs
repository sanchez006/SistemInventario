using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("partidos")]
    public class Partido
    {
    [Column("id")]
    public int Id { get; set; }
    [Column("equipo_local_id")]
    public int EquipoLocalId { get; set; }
    [Column("equipo_visitante_id")]
    public int EquipoVisitanteId { get; set; }
    [Column("fecha")]
    public DateTime Fecha { get; set; }
    [Column("marcador_local")]
    public int MarcadorLocal { get; set; }
    [Column("marcador_visitante")]
    public int MarcadorVisitante { get; set; }
    [Column("cuarto_actual")]
    public int CuartoActual { get; set; }
    [Column("terminado")]
    public bool Terminado { get; set; }
    [Column("creado_en")]
    public DateTime CreadoEn { get; set; }
    }
}