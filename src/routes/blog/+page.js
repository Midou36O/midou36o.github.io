export async function load( { data, fetch } ) {
   
    const endpoint = "http://127.0.0.1:8055/items/Data";

       	const res = await fetch(endpoint);
        const content = await res.json();
        console.log(content.data);
    return {
      content: content 
    }
    
}