using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
        [Authorize]
        [Route("api/[controller]")]
    public class RosterPartidoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RosterPartidoController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RosterPartido>>> GetRosterPartido()
        {
            return await _context.RosterPartido.ToListAsync();
        }

       
        [HttpGet("{id}")]
        public async Task<ActionResult<RosterPartido>> GetRosterPartido(int id)
        {
            var registro = await _context.RosterPartido.FindAsync(id);
            if (registro == null)
            {
                return NotFound();
            }
            return registro;
        }

    [HttpPost]
    [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RosterPartido>> PostRosterPartido(RosterPartido registro)
        {
            if (registro == null)
                return BadRequest("Datos de registro requeridos.");

            _context.RosterPartido.Add(registro);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRosterPartido), new { id = registro.Id }, registro);
        }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutRosterPartido(int id, RosterPartido registro)
        {
            if (registro == null)
                return BadRequest("Datos de registro requeridos.");

            if (id != registro.Id)
                return BadRequest("El ID de la URL no coincide con el del registro.");

            _context.Entry(registro).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.RosterPartido.Any(r => r.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

      
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRosterPartido(int id)
        {
            if (id <= 0)
                return BadRequest("ID inválido.");

            var registro = await _context.RosterPartido.FindAsync(id);
            if (registro == null)
                return NotFound("No se encontró el registro.");

            _context.RosterPartido.Remove(registro);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
