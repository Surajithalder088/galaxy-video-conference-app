export async function startVideo (videoElement){

    const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true})

    videoElement.srcObject  =stream ; 
}