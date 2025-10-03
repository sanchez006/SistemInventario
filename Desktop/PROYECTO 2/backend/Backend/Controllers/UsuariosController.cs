using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

       
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }
            return usuario;
        }

    [HttpPost]
    [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            if (usuario == null)
                return BadRequest("Datos de usuario requeridos.");

            if (string.IsNullOrWhiteSpace(usuario.Username))
                return BadRequest("El nombre de usuario es obligatorio.");

            bool usernameDuplicado = _context.Usuarios.Any(u => u.Username == usuario.Username);
            if (usernameDuplicado)
                return Conflict("Ya existe un usuario con ese nombre de usuario.");

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
        }

       
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {
            if (usuario == null)
                return BadRequest("Datos de usuario requeridos.");

            if (id != usuario.Id)
                return BadRequest("El ID de la URL no coincide con el del usuario.");

            if (string.IsNullOrWhiteSpace(usuario.Username))
                return BadRequest("El nombre de usuario es obligatorio.");

            bool usernameDuplicado = _context.Usuarios.Any(u => u.Username == usuario.Username && u.Id != id);
            if (usernameDuplicado)
                return Conflict("Ya existe otro usuario con ese nombre de usuario.");

            _context.Entry(usuario).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Usuarios.Any(u => u.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

       
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            if (id <= 0)
                return BadRequest("ID inválido.");

            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound("No se encontró el usuario.");

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
