import React, { Component } from 'react';
import ReactCrop from 'react-image-crop'
import "react-image-crop/dist/ReactCrop.css";
import './App.css';



var Tesseract = window.Tesseract;

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      src: '',
      crop: {
        x: 0, 
        y: 0
      }
    };
  }

  onSelectFile = e => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        this.setState({ src: reader.result }),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  onImageLoaded = (image, pixelCrop) => {
    this.imageRef = image;
  }

  onCropChange = crop => {
    this.setState({ crop });
  };

  onCropComplete = (crop, pixelCrop) => {
    this.makeClientCrop(crop, pixelCrop);
  };
  async makeClientCrop(crop, pixelCrop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        pixelCrop,
        'newFile.jpeg',
      );
      this.setState({ croppedImageUrl });
       Tesseract.recognize(this.state.croppedImageUrl, {
        lang: 'jpn',
        chop_enable: 1,
        use_new_state_cost: 0,
        segment_segcost_rating: 0,
        enable_new_segsearch: 0,
        language_model_ngram_on: 0,
        textord_force_make_prop_words: 0,
        edges_max_childre_per_outline: 40,
        tessedit_pageseg_mode: 3
      })
      .then(result => {
        console.log("hi");
        console.log(result);
      })
    }
  }

  getCroppedImg(image, pixelCrop, fileName) {
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );


    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, 'image/jpeg');
    });
  }

  render() {
    const {croppedImageUrl} = this.state;

    return (
      <div>
        <nav className='block sticky'>
          <ul className="nav">
            <li>Home</li>
            <li>Books</li>
            <li className="right">Account</li>
          </ul>
        </nav>
        <div className="container">
          <div className='block side'>
            <input type="file" name="file" id="file" className="inputfile" onChange={this.onSelectFile} />
            <label for="file">Add Page</label>
          </div>
          <div className='block display-page'>
              <ReactCrop
              src={this.state.src}
              crop={this.state.crop}
              onChange={this.onCropChange}
              onComplete={this.onCropComplete}
              onImageLoaded={this.onImageLoaded}
            />
          </div>
          {croppedImageUrl && <img className="block" alt="Crop" src={croppedImageUrl} />}
        </div>

      </div>
    );
  }
}

export default App;
