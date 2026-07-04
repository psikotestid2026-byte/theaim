from PIL import Image

def process_image(input_path, output_path):
    try:
        # Open and convert to RGBA
        img = Image.open(input_path).convert("RGBA")
        
        # Load pixels
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Change all white (and near white)
            # to transparent
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Crop the image to its bounding box of non-transparent pixels
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print("Successfully processed the logo: cropped and removed background.")
    except Exception as e:
        print("Error processing image:", e)

# Execute
process_image("Logo2/Logo theaim.id.png", "Logo2/Logo theaim.id.png")
