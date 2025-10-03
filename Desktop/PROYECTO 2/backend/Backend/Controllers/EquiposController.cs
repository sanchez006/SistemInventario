using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquiposController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EquiposController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Equipo>>> GetEquipos([FromQuery] string? q, [FromQuery] int? page, [FromQuery] int? pageSize)
        {
            var query = _context.Equipos.AsQueryable();
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(e => e.Nombre.ToLower().Contains(term) || (e.Ciudad != null && e.Ciudad.ToLower().Contains(term)));
            }
            if (page.HasValue && pageSize.HasValue && page > 0 && pageSize > 0)
            {
                query = query.Skip((page.Value - 1) * pageSize.Value).Take(pageSize.Value);
            }
            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Equipo>> GetEquipo(int id)
        {
            var equipo = await _context.Equipos.FindAsync(id);
            if (equipo == null)
                return NotFound();
            return equipo;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Equipo>> PostEquipo(Equipo equipo)
        {
            if (string.IsNullOrWhiteSpace(equipo.Nombre))
                return BadRequest("El nombre del equipo es obligatorio.");

            bool nombreDuplicado = _context.Equipos.Any(e => e.Nombre == equipo.Nombre);
            if (nombreDuplicado)
                return Conflict("Ya existe un equipo con ese nombre.");

            _context.Equipos.Add(equipo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEquipo), new { id = equipo.Id }, equipo);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutEquipo(int id, Equipo equipo)
        {
            if (equipo == null)
                return BadRequest("Datos de equipo requeridos.");

            if (id != equipo.Id)
                return BadRequest("El ID de la URL no coincide con el del equipo.");

            if (string.IsNullOrWhiteSpace(equipo.Nombre))
                return BadRequest("El nombre del equipo es obligatorio.");

            bool nombreDuplicado = _context.Equipos.Any(e => e.Nombre == equipo.Nombre && e.Id != id);
            if (nombreDuplicado)
                return Conflict("Ya existe otro equipo con ese nombre.");

            _context.Entry(equipo).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Equipos.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEquipo(int id)
        {
            if (id <= 0)
                return BadRequest("ID inválido.");

            var equipo = await _context.Equipos.FindAsync(id);
            if (equipo == null)
                return NotFound("No se encontró el equipo.");

            _context.Equipos.Remove(equipo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}