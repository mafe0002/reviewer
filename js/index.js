
var app = {
    KEY: 'mafe0002', 
    reviewedList: document.getElementById('reviewedList'), 
    details: document.getElementById('details'),
    addItems:  document.getElementById('addItems'),
    add: document.getElementById('add'), 
    back: document.getElementById('back'), 
    save: document.getElementById('save'), 
    backB: document.getElementById('backB'),
    delete: document.getElementById('del'),
	thumbUp: document.getElementById('thumbUp'),
	thumbDown: document.getElementById('thumbDown'),   
	photoTaken: false,
	saveInPhotoLibrary: false,
	uri: '',
    reviews: [{"id":237428374, "name":"Timmies", "rating":4,                              "img":"img/timmies.jpeg", "msg": "Cool"},
             {"id":123987944, "name":"Starbucks", "rating":4, "img":"img/starbucks.jpeg", "msg": "Nice"}
           ],
    // Application Constructor
    init: ()=>{
        //creating all ev listeners
        
           let cam = document.querySelector('.camera #pic');
           cam.addEventListener('click', app.takePicture),
        (app.save).addEventListener('click', app.addReview);
    
        let stars = document.querySelectorAll('#addItems .star');
        stars.forEach(star=>{
            star.addEventListener('click', app.setRating);
        });
    
        app.backB.addEventListener('click', app.showReview),
        app.back.addEventListener('click', app.showReview),
        app.add.addEventListener('click', app.showForm),
        app.delete.addEventListener('click', app.deleteReview),
		app.thumbUp.addEventListener('click', app.noPermanentSave),
		app.thumbDown.addEventListener('click', app.savePermanently);
    
        let rating = parseInt(document.querySelector('.stars').getAttribute('data-rating')),
        target = stars[rating - 1];
        target.dispatchEvent(new MouseEvent('click'));

        //checking local storage
        app.checkLocal();
        
        //check if browser supports template
        if(app.supportsTemplate()){
           //console.log('supports template');
            app.useTemplate();
        }else{
            app.createIndividualCard();
        }
    },
    takePicture: ()=>{
        var options = {
            quality: 50,
            DestinationType: Camera.DestinationType.FILE_URI,//NATIVE_URI
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: true,
            cameraDirection: Camera.Direction.BACK,
            targetWidth: 300,
            targetHeight: 400,
            correctOrientation: true}
        
          navigator.camera.getPicture(app.successful, app.failed, options);
            
    },
    successful: (imgURI) => {
       let image = document.getElementById('photo').src = imgURI,
	   photoLibrary = "Save Image to Photo Library?";
	   document.getElementById('photo').style.display = "block";
	   app.uri = imgURI;
	   app.saveInPhotoLibrary = true;
       app.photoTaken = true;
	   
	   app.overlay(photoLibrary);
    },
    failed: (msg) => {
        document.getElementById('msg').textContent = msg;
    },
	overlay: function(message){
		let Overlay =   document.querySelector('#addItems .content .overlay');
		
		if(app.saveInPhotoLibrary){
			//Save to Photo Libary
			let permDiv = document.getElementById('permanent'),
			p = document.querySelector('#permanent p');
			p.textContent = message;
			permDiv.style.display = "block";
			Overlay.style.display = "block";
		}else{
		//display overlay
            Overlay.textContent = message;
            Overlay.style.display = "block";
		
		 //remove overlay
        setTimeout(()=>{
            Overlay.style.display = "none";}, 2000);
			}
	},
	noPermanentSave: () => {
		let Overlay =   document.querySelector('#addItems .content .overlay'),
		permDiv = document.getElementById('permanent');
		
		Overlay.style.display = "none";
		permDiv.style.display = "none";
	},
	savePermanently: (path) => {
		let Overlay =   document.querySelector('#addItems .content .overlay'),
		permDiv = document.getElementById('permanent');
		
		Overlay.style.display = "none";
		permDiv.style.display = "none";
		path = app.uri;
		
	     //save image to permanent location
	    window.cordova.plugins.imagesaver.saveImageToGallery(path, function() {
			console.log("good");
		}, 
		function() {
			console.log("bad");
		});
		
		console.log(path);
},
    setRating: (ev)=>{
         let current = ev.currentTarget,
         stars = document.querySelectorAll('#addItems .star'),
         match = false,
         num = 0;
        
        stars.forEach(function(star, index){
            if(match){
                star.classList.remove('rated');
            }else{
                star.classList.add('rated');
            }
            if(star === current){
                match = true;
                num = index + 1;
            }
        });
        document.querySelector('.stars').setAttribute('data-rating', num);
    },
    checkLocal: ()=>{
        let local = localStorage.getItem('app.KEY');
        if(local){
            app.updateReview();
        }else{
            app.updateLocal();
        }
    },
    updateReview: ()=>{
        app.reviews = JSON.parse(localStorage.getItem('app.KEY'));
    },
    updateLocal: ()=>{
        let local = localStorage.setItem('app.KEY', JSON.stringify(app.reviews));
    },
    addReview: ()=>{
        let name = document.getElementById('nm').value,
        rating = parseInt(document.querySelector('.stars').getAttribute('data-rating')),
        input = document.getElementById('textreview').value,
        image = app.uri,
        id = Date.now(),
		values = "",
		Overlay =   document.querySelector('#addItems .content .overlay');
		app.saveInPhotoLibrary = false;
		
		console.log(app.uri);
		if((name != values) && (input != values)){
        let justReviewed = [{"id": id,
                           "name": name,
                           "rating": rating,
                           "img": image,
                            "msg": input}];
        if(app.photoTaken){
      //update reviews array
        app.reviews = (app.reviews).concat(justReviewed);
       
        //update local storage
        app.updateLocal();
			
        //display overlay
		Overlay.textContent = "Review Saved Successfully.";
        Overlay.style.display = "block";
        
        //remove overlay
        setTimeout(()=>{
            Overlay.style.display = "none";
           app.showReview();
           location.reload();
           app.useTemplate();
        }, 400);
        }else{
            //display overlay
			let picFirst = "Picture of reviewed item has to be taken first.";
            
			app.overlay(picFirst);
        }
	}else{
		 //display overlay
		     let nameComment = "Review name and comments has to be inputed.";
             
		     app.overlay(nameComment);
	}
        
    },
    supportsTemplate: ()=>{ 
        return "content" in document.createElement('template');
    },
    useTemplate: ()=>{
            document.querySelector('.list-view').innerHTML = "";
            //clone the templates for the number of items in reviews array
            let reviews = app.reviews;
        if(reviews.length === 0){
           let empty = document.getElementById('emptyTemplate').content.cloneNode(true);
            empty.querySelector('p').style.textAlign = "center";
            empty.querySelector('p').style.paddingTop ="1rem";
            
            document.querySelector('.list-view').appendChild(empty);
           }else{
        for(var i = 0; i < reviews.length; i++){
            let result = reviews[i],
            template = document.getElementById('template').content.cloneNode(true);
            
            //setting attributes and values for elements in template
            template.querySelector('img').setAttribute('src', result.img),
            template.querySelector('img').setAttribute('alt', result.name),
            template.getElementById('name').innerText = result.name,
            template.querySelector('.list-item').setAttribute('id', result.id);
            
            //set attribute for each star p
            template.getElementById('stars').setAttribute('data-rating', result.rating);
            template.getElementById('right').addEventListener('click', app.showDetails);
             //use the value to display rating
            let stars = template.querySelectorAll('.star'),
            number = template.getElementById('stars').getAttribute('data-rating');
            
            for(var c = 0; c < number; c++ ){
                stars[c].classList.add('rated');
            }
            
            document.querySelector('.list-view').appendChild(template);
            }
        }
        
    },
    showReview: ()=>{
       
        if((app.addItems).className === 'page active'){
        app.addItems.classList.remove('active'),
        app.reviewedList.classList.add('active');
            
    }else{
        let  div = document.getElementById('card');
        div.parentNode.removeChild(div);
        app.details.classList.remove('active'),
        app.reviewedList.classList.add('active');
}
    },
    showDetails: (ev)=>{
        document.querySelector('#details .content').childNodes[2].innerHTML = " ";
        
        app.reviewedList.classList.remove('active');
        app.details.classList.add('active');
        
        let details = ev.currentTarget,
        id = (details.parentNode).id,
        reviews = app.reviews;
        
        reviews.forEach(review => {
            if((review.id) == id){
                let template2 = document.getElementById('detailsTemplate').content.cloneNode(true);
               
              template2.querySelector('div').setAttribute('data-id', review.id); 
               
            template2.querySelector('div').setAttribute('id', 'card'); template2.getElementById('stars').setAttribute('data-rating', review.rating);
                template2.getElementById('detailsName').innerText = review.name;
                template2.querySelector('img').setAttribute('src', review.img);
                template2.querySelector('img').setAttribute('alt', review.name);
                template2.getElementById('msg').innerText = review.msg;
                let stars = template2.querySelectorAll('.star'),
                number = template2.getElementById('stars').getAttribute('data-rating');
                
                 for(var c = 0; c < number; c++ ){
                stars[c].classList.add('rated');
            }
                document.querySelector('#details .content').appendChild(template2);
            }
        });
        
    },
    showForm: ()=>{
        app.reviewedList.classList.remove('active'),
        app.addItems.classList.add('active');
    },
    deleteReview: ()=>{
        
        let detailedReview = document.querySelector('#details .content'),
        div = document.getElementById('card'),
        id = div.getAttribute('data-id');
        div.parentNode.removeChild(div);
        
        app.reviews = app.reviews.filter(review => review.id != id);
 
        //display overlay
        document.querySelector('#details .content .overlay').style.display = "block";
        
        //remove overlay
        setTimeout(()=>{
            document.querySelector('#details .content .overlay').style.display = "none";
           app.updateLocal();
           app.useTemplate();
          app.details.classList.remove('active'),
          app.reviewedList.classList.add('active');
        }, 400);
       
    }
//    
};

let deviceready = ('deviceready' in document) ? 'deviceready' : 'DOMContentLoaded';
document.addEventListener(deviceready, app.init);
//start out with file path for image, then change the path in local storage.
