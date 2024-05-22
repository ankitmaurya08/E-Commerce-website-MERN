function addToCart(productId) {

    const cartNoElement = document.getElementById('cart_no');
    let cartNo = parseInt(cartNoElement.innerHTML, 10);
    cartNo = 
    cartNoElement.innerHTML = cartNo;


    const cartDetail = {
        product_Id: productId,
    };


    fetch('/addToCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartDetail)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

}