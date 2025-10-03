using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("roster_partido")]
    public class RosterPartido
    {
    [Column("id")]
    public int Id { get; set; }
    [Column("partido_id")]
    public int PartidoId { get; set; }
    [Column("equipo_id")]
    public int EquipoId { get; set; }
    [Column("jugador_id")]
    public int JugadorId { get; set; }
    }
}