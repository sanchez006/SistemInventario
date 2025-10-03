using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartidosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartidosController(AppDbContext context)
        {
            _context = context;
        }

       
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPartidos([FromQuery] string? q, [FromQuery] bool? terminado, [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var query = from p in _context.Partidos
                        join el in _context.Equipos on p.EquipoLocalId equals el.Id
                        join ev in _context.Equipos on p.EquipoVisitanteId equals ev.Id
                        select new
                        {
                            p,
                            el,
                            ev
                        };

            if (terminado.HasValue)
            {
                query = query.Where(x => x.p.Terminado == terminado.Value);
            }
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(x => x.el.Nombre.ToLower().Contains(term) || x.ev.Nombre.ToLower().Contains(term));
            }

            var shaped = query.Select(x => new
            {
                id = x.p.Id,
                fecha = x.p.Fecha,
                equipoLocalId = x.p.EquipoLocalId,
                equipoVisitanteId = x.p.EquipoVisitanteId,
                marcadorLocal = x.p.MarcadorLocal,
                marcadorVisitante = x.p.MarcadorVisitante,
                cuartoActual = x.p.CuartoActual,
                terminado = x.p.Terminado,
                creadoEn = x.p.CreadoEn,
                equipo_local = new { id = x.el.Id, nombre = x.el.Nombre, logo = x.el.Logo, ciudad = x.el.Ciudad },
                equipo_visitante = new { id = x.ev.Id, nombre = x.ev.Nombre, logo = x.ev.Logo, ciudad = x.ev.Ciudad }
            });

            if (page.HasValue && pageSize.HasValue && page > 0 && pageSize > 0)
            {
                shaped = shaped.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }

            var data = await shaped.ToListAsync();
            return Ok(data);
        }

        
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPartido(int id)
        {
            var partido = await (
                from p in _context.Partidos
                join el in _context.Equipos on p.EquipoLocalId equals el.Id
                join ev in _context.Equipos on p.EquipoVisitanteId equals ev.Id
                where p.Id == id
                select new
                {
                    id = p.Id,
                    fecha = p.Fecha,
                    equipoLocalId = p.EquipoLocalId,
                    equipoVisitanteId = p.EquipoVisitanteId,
                    marcadorLocal = p.MarcadorLocal,
                    marcadorVisitante = p.MarcadorVisitante,
                    cuartoActual = p.CuartoActual,
                    terminado = p.Terminado,
                    creadoEn = p.CreadoEn,
                    equipo_local = new { id = el.Id, nombre = el.Nombre, logo = el.Logo, ciudad = el.Ciudad },
                    equipo_visitante = new { id = ev.Id, nombre = ev.Nombre, logo = ev.Logo, ciudad = ev.Ciudad }
                }
            ).FirstOrDefaultAsync();

            if (partido == null) return NotFound();
            return Ok(partido);
        }

    [HttpPost]
    [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Partido>> PostPartido(Partido partido)
        {
            if (partido == null)
                return BadRequest("Datos de partido requeridos.");

            if (partido.Fecha == default)
                return BadRequest("La fecha del partido es obligatoria.");

            _context.Partidos.Add(partido);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPartido), new { id = partido.Id }, partido);
        }

      
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPartido(int id, Partido partido)
        {
            if (partido == null)
                return BadRequest("Datos de partido requeridos.");

            if (id != partido.Id)
                return BadRequest("El ID de la URL no coincide con el del partido.");

            if (partido.Fecha == default)
                return BadRequest("La fecha del partido es obligatoria.");

            _context.Entry(partido).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Partidos.Any(p => p.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePartido(int id)
        {
            if (id <= 0)
                return BadRequest("ID inválido.");

            var partido = await _context.Partidos.FindAsync(id);
            if (partido == null)
                return NotFound("No se encontró el partido.");

            _context.Partidos.Remove(partido);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/estado")]
        [Authorize]
        public async Task<IActionResult> PutEstado(int id, [FromBody] PartidoEstadoDto dto)
        {
            var partido = await _context.Partidos.FindAsync(id);
            if (partido == null) return NotFound();

            partido.MarcadorLocal = dto.MarcadorLocal;
            partido.MarcadorVisitante = dto.MarcadorVisitante;
            partido.CuartoActual = dto.CuartoActual;
            partido.Terminado = dto.Terminado;
            

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class PartidoEstadoDto
    {
        public int MarcadorLocal { get; set; }
        public int MarcadorVisitante { get; set; }
        public int CuartoActual { get; set; }
        public bool Terminado { get; set; }
        public int? TiempoRestanteSeg { get; set; }
    }
}
