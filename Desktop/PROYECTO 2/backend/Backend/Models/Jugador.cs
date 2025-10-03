using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("jugadores")]
    public class Jugador
    {
        [Column("id")]
        public int Id { get; set; }
        [Column("equipo_id")]
        public int EquipoId { get; set; }
        [Column("numero")]
        public int Numero { get; set; }
        [Column("estatura")]
        public decimal Estatura { get; set; }
        [Column("edad")]
        public int Edad { get; set; }
        [Column("nombre")]
        public required string Nombre { get; set; }
        [Column("posicion")]
        public required string Posicion { get; set; }
        [Column("nacionalidad")]
        public required string Nacionalidad { get; set; }
        [Column("creado_en")]
        public DateTime CreadoEn { get; set; }
    }
}