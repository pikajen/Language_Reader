import React, { Component } from 'react';
import RegionSelect from 'react-region-select'
import ReactCrop from 'react-image-crop'
import './App.css';



var Tesseract = window.Tesseract;

class App extends Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      regions: [],
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
  onChange (regions) {
    this.setState({
      regions: regions
    });
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
    const regionStyle = {
      background: 'rgba(255, 0, 0, 0.5)'
    };

    const {croppedImageUrl} = this.state;

    return (
      <div style={{ display: 'flex' }}>
        <div>
          <input type="file" onChange={this.onSelectFile} />
        </div>
        <div style={{ flexGrow: 1, flexShrink: 1, width: '50%' }}>
          <RegionSelect
            maxRegions={1}
            regions={this.state.regions}
            regionStyle={regionStyle}
            constraint
            onChange={this.onChange}
            style={{ border: '1px solid black' }}
          >
            <ReactCrop
            src={this.state.src}
            crop={this.state.crop}
            onChange={this.onCropChange}
            onComplete={this.onCropComplete}
            onImageLoaded={this.onImageLoaded}
          />
          </RegionSelect>
          {croppedImageUrl && <img alt="Crop" src={croppedImageUrl} />}
        </div>

      </div>
    );
  }
}

export default App;
