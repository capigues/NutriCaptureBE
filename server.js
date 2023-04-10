const { spawn } = require('child_process');
const express = require("express")
const cors = require('cors')
const fileUpload = require('express-fileupload');
const fs = require('fs')
var base64Img = require('base64-img');
const bodyParser = require('body-parser');
const app = express()

require("dotenv").config()
const PORT = process.env.PORT || 3000

app.use(cors({origin: ['http://localhost:19006', '*']}))
app.use(bodyParser.json());
app.use(fileUpload({
    tempFileDir: './uploads/',
    useTempFiles: true,
}));

app.get('/classes', (req, res) => {
    res.json({
        1:'bangbang-chicken',
        2:'dan-dan-noodles',
        3: 'sichuan-hot-pot',
        4: 'twice-cooked-pork',
        5: 'wontons-in-chili-oil',
    })
})

app.post('/upload', (req, res) => {
    // Access the uploaded file using req.files
    const uploadedFile = req.files.file;
    console.log(uploadedFile.values)
    res.send(uploadedFile)
});
 
app.post('/predict', (req, res) => {
    let file;
    if (req.body) {
        file = base64Img.imgSync(req.body.file, 'uploads', 'file')
    }

    if (req.files && req.files.file) {
        file = req.files.file.tempFilePath
    }

    let pred_data = {}
    const pythonProcess = spawn('python', ['./pyscripts/models.py', JSON.stringify([file])]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            console.log(JSON.parse(data.toString()))
            pred_data = JSON.parse(data.toString())
        } catch (error) {
            console.log(data.toString())
            console.error(error)
        }
    });
    
    pythonProcess.stderr.on('data', (data) => {
        pred_data = JSON.parse(data.toString())
    });

    pythonProcess.on('exit', (code) => {
        console.log(`Python script exited with code ${code}`);
        if (code == 0) {
            console.log(pred_data)
            res.status(200).json(pred_data)
        } else {
            res.status(400).json({message: "Python script error", error: pred_data['stderr']})
        }
    });
})

app.listen(PORT, () => {
    console.log('Listing on port:', PORT)
})