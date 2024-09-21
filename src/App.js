import React, { useState } from 'react'
import styled from 'styled-components'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const App = () => {
  const [files, setFiles] = useState([])
  const [borderColor, setBorderColor] = useState('#000000')
  const [borderWidth, setBorderWidth] = useState(5)

  const handleFileChange = (event) => {
    const uploadedFiles = Array.from(event.target.files).filter((file) => file.type.startsWith('image'))
    setFiles(uploadedFiles)
  }

  const handleBorderColorChange = (e) => {
    setBorderColor(e.target.value)
  }

  const handleBorderWidthChange = (e) => {
    setBorderWidth(Number(e.target.value))
  }

  const handleDownloadZip = async () => {
    const zip = new JSZip()

    const filePromises = files.map((file) => processImageFile(file, zip))

    await Promise.all(filePromises)

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'files.zip')
    })
  }

  const processImageFile = (file, zip) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const image = new Image()
      image.src = URL.createObjectURL(file)

      image.onload = () => {
        canvas.width = image.width + 2 * borderWidth
        canvas.height = image.height + 2 * borderWidth
        context.fillStyle = borderColor
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, borderWidth, borderWidth)
        canvas.toBlob((blob) => {
          zip.file(file.name, blob)
          resolve()
        })
      }
    })
  }

  return (
    <Container>
      <Title>Border Tool for Images</Title>

      <InputSection>
        <label htmlFor='file-upload'>Upload Images:</label>
        <input type='file' id='file-upload' onChange={handleFileChange} multiple accept='image/*' />

        <label htmlFor='border-color'>Border Color:</label>
        <input type='color' id='border-color' value={borderColor} onChange={handleBorderColorChange} />

        <label htmlFor='border-width'>Border Width (px):</label>
        <input type='number' id='border-width' value={borderWidth} onChange={handleBorderWidthChange} />
      </InputSection>

      <PreviewSection>
        {files.map((file, index) => (
          <ImagePreview key={index}>
            <img src={URL.createObjectURL(file)} alt={file.name} style={{ border: `${borderWidth}px solid ${borderColor}` }} />
          </ImagePreview>
        ))}
      </PreviewSection>

      <DownloadButton onClick={handleDownloadZip}>Download All as ZIP</DownloadButton>
    </Container>
  )
}

export default App

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
`

const Title = styled.h1`
  font-size: 2em;
  margin-bottom: 20px;
`

const InputSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  input {
    padding: 5px;
    font-size: 1em;
  }
`

const PreviewSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`

const ImagePreview = styled.div`
  img {
    max-width: 200px;
    max-height: 200px;
  }
`

const DownloadButton = styled.button`
  padding: 10px 20px;
  font-size: 1.2em;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background-color: #0056b3;
  }
`
