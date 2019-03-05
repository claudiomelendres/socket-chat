const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../util/utilidades');


const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback)  => {

        //console.log(data);

        if ( !data.nombre  || !data.sala ){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala) );

        callback(personas);

        // console.log('--------');
        // console.log(data);
    
    });

    // esto en el explorador para mandar el mensaje a todos
    //socket.emit('crearMensaje', { mensaje: 'hello everybody' });   

    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje( persona.nombre, data.mensaje );
        client.broadcast.to(persona.sala).emit('crearMensaje',mensaje);
    })


    client.on('disconnect', () => {
        console.log(client.id);
        let personaBorrada = usuarios.borrarPersona( client.id );
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador',`${ personaBorrada.nombre } salio del chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala) );


    });

    // Mensajes privados
    // socket.emit('mensajePrivado', { mensaje: 'hello Karol', para: 'h40q1Dy5AxxNw_IOAAAD'});
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona( client.id );
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje( persona.nombre, data.mensaje ));
    })
 


});