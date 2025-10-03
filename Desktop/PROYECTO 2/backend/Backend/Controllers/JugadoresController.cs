using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
        [Authorize]
        [Route("api/[controller]")]
    public class JugadoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JugadoresController(AppDbContext context)
        {
            _context = context;
        }

      
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jugador>>> GetJugadores([FromQuery] string? q, [FromQuery] int? equipoId, [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var query = _context.Jugadores.AsQueryable();
            if (equipoId.HasValue && equipoId > 0)
            {
                query = query.Where(j => j.EquipoId == equipoId);
            }
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(j => j.Nombre.ToLower().Contains(term) || j.Posicion.ToLower().Contains(term) || j.Nacionalidad.ToLower().Contains(term));
            }
            if (page.HasValue && pageSize.HasValue && page > 0 && pageSize > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }
            return await query.ToListAsync();
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<Jugador>> GetJugador(int id)
        {
            var jugador = await _context.Jugadores.FindAsync(id);
            if (jugador == null)
            {
                return NotFound();
            }
            return jugador;
        }

        
    [HttpPost]
    [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Jugador>> PostJugador(Jugador jugador)
        {
           
            if (jugador == null)
                return BadRequest("Datos de jugador requeridos.");

         
            if (string.IsNullOrWhiteSpace(jugador.Nombre))
                return BadRequest("El nombre del jugador es obligatorio.");

            bool numeroDuplicado = _context.Jugadores.Any(j => j.EquipoId == jugador.EquipoId && j.Numero == jugador.Numero);
            if (numeroDuplicado)
                return Conflict("Ya existe un jugador con ese número en el equipo.");

            _context.Jugadores.Add(jugador);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetJugador), new { id = jugador.Id }, jugador);
        }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutJugador(int id, Jugador jugador)
        {
            if (jugador == null)
                return BadRequest("Datos de jugador requeridos.");

            if (id != jugador.Id)
                return BadRequest("El ID de la URL no coincide con el del jugador.");

            if (string.IsNullOrWhiteSpace(jugador.Nombre))
                return BadRequest("El nombre del jugador es obligatorio.");

            bool numeroDuplicado = _context.Jugadores.Any(j => j.EquipoId == jugador.EquipoId && j.Numero == jugador.Numero && j.Id != id);
            if (numeroDuplicado)
                return Conflict("Ya existe otro jugador con ese número en el equipo.");

            _context.Entry(jugador).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Jugadores.Any(j => j.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

     
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteJugador(int id)
        {
            if (id <= 0)
                return BadRequest("ID inválido.");

            var jugador = await _context.Jugadores.FindAsync(id);
            if (jugador == null)
                return NotFound("No se encontró el jugador.");

            _context.Jugadores.Remove(jugador);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
