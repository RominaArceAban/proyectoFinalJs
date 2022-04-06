
  const container = document.querySelector(".container");
  const main = document.querySelector("#main");
  const sectionCarrito = document.querySelector(".sectionCarrito");
  const btnCarrito = document.querySelector(".btnCarrito");
  
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  

  btnCarrito.addEventListener("click", () => {
    sectionCarrito.classList.toggle("active");

    if (carrito.lenght === 0) {
      Swal.fire({
        title:"El carrito se encuentra vacio",
        icon:"info",
        toast: true
      })
    }
  });


  async function cargarProductos() {
    const response = await fetch('./productos.json')
    return await response.json()
}
  

  cargarProductos().then(productos => {
    productos.forEach((element) => {
      main.innerHTML += `
                <div class="caja">
                  <img data-img="${element.img}" src="./img/${element.img}" class="card-img-top" alt="${element.nombre}">
                  <p class="nombre">${element.nombre}</p>
                  <p class="precio"> $ <span>${element.precio}</span> </p>
                <button class="btnAgregar" data-id="${element.id}">Agregar</button>
                </div>
                `;
    });

    const btnAgregar = document.querySelectorAll(".btnAgregar");
    btnAgregar.forEach((e) =>
      e.addEventListener("click", (e) => {
        let cardPadre = e.target.parentElement;
  
        agregarAlCarrito(cardPadre);
      })
    );
  });
  

  const agregarAlCarrito = (cardPadre) => {

    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      text: 'Producto agregado al carrito',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })

    let producto = {
      nombre: cardPadre.querySelector(".nombre").textContent,
      precio: Number(cardPadre.querySelector(".precio span").textContent),
      cantidad: 1,
      id: Number(cardPadre.querySelector("button").getAttribute("data-id")),
      img: cardPadre.querySelector(".card-img-top").getAttribute("data-img"),
    };
  
    let productoEncontrado = carrito.find(
      (element) => element.id === producto.id
    );

    productoEncontrado ? productoEncontrado.cantidad++ : carrito.push(producto)
  
    console.log(carrito);
    mostrarCarrito();
  };
  

  const mostrarCarrito = () => {
    sectionCarrito.innerHTML = "";
    carrito.forEach((element) => {
      let { img, nombre, precio, cantidad, id } = element;
      sectionCarrito.innerHTML += `
            <div class="caja--carrito">
              <div class="caja--img">
                <img src="./img/${img}" class="card-img-top" alt="${nombre}">
              </div>
              <div class="caja--texto">
                <p class="nombre">${nombre}</p>
                <p class="precio">Precio $ <span>${precio}</span> </p>
                <p class="cantidad">Cantidad: ${cantidad}</p>
                <p class="subtotal">Subtotal: $${precio * cantidad}</p>
                <button class="boton btn-restar" data-id="${id}">-</button>
                <button class="boton btn-borrar" data-id="${id}">BORRAR</button>
              </div>   
          </div>`;
    });
    localStorage.setItem("carrito", JSON.stringify(carrito));
    aumentarNumeroCantidadCarrito();
    calcularTotal();
  };
  

  const restarProducto = (productoRestar) => {
    let productoEncontrado = carrito.find(
      (element) => element.id === Number(productoRestar)
    );
    if (productoEncontrado) {
      productoEncontrado.cantidad--;
      if (productoEncontrado.cantidad === 0) {
        borrarProducto(productoRestar);
      }
    }
    mostrarCarrito();
  };
  

  const borrarProducto = (productoBorrar) => {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'error',
      text: 'Producto eliminado del carrito',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })

    carrito = carrito.filter((element) => element.id !== Number(productoBorrar));
    mostrarCarrito();
  };
  

  const btnSectionCarrito = () => {
    sectionCarrito.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-restar")) {
        restarProducto(e.target.getAttribute("data-id"));
      }
      if (e.target.classList.contains("btn-borrar")) {
        borrarProducto(e.target.getAttribute("data-id"));
      }
    });
  };


  const aumentarNumeroCantidadCarrito = () => {
    let total = carrito.reduce((acc, ite) => acc + ite.cantidad, 0);
    //document.querySelector(".cant--carrito").textContent = total;
    //acc: acumulador   ite:iterador
  };

  const vaciarCarrito = () => {
    carrito = []
    sectionCarrito.classList.toggle("active");
    mostrarCarrito();
  };

  const calcularTotal = () => {
    if(carrito.lenght !== 0) {
      let total = carrito.reduce((acc,ite) => acc + ite.precio*ite.cantidad,0)

      let divTotal = document.createElement("div")
      divTotal.className = "divTotal"
      divTotal.id = "total--compra"

      divTotal.innerHTML = `<p class="caja--texto">TOTAL: $${total}</p><button class="boton">COMPRAR</button>`
      sectionCarrito.appendChild(divTotal);

      let botonComprar = document.querySelector("#total--compra");
      botonComprar.onclick = () => {
        const mixin = Swal.mixin();

        mixin.fire({
          title:"Complete sus datos",
          html: `Nombre <input id="nombre" type="text" class="swal2-input">
          <br>
          Nro tarjeta <input id="tarjeta" type="number" class="swal2-input">
          <br>
          Telefono <input id="telefono" type="number" class="swal2-input">
          <br>
          Direccion <input id="direccion" type="text" class="swal2-input">
          <br>
          Email <input id="email" type="email" class="swal2-input">
          <br>
          <br>
          <p>Su Total a pagar es $${total}</p>
          `,
          confirmButtonText: "CONFIRMAR COMPRA",
          confirmButtonColor: "green",
          cancelButtonText: "CANCELAR COMPRA",
          showCloseButton: true,
          showCancelButton: true,
          allowOutsideClick: false,

          preConfirm: () => {
            let nombre = Swal.getPopup().querySelector("#nombre").value;
            if(!nombre) {
              Swal.showValidationMessage("Por favor, ingrese un nombre");
            }
            return nombre;
          },  
        })
        .then((response) => {
          if (response.isConfirmed) {
            vaciarCarrito()
            mixin.fire(
            "Confirmacion de compra realizada",
            "Verifica tu correo para seguir tu pedido.Gracias por elegirlos!",
            );
          }
        });
      };
    };
  }
  

  cargarProductos();
  mostrarCarrito();
  btnSectionCarrito();