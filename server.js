const { spawn } = require('child_process');
const express = require("express")
const bodyParser = require('body-parser');
const app = express()

app.use(bodyParser.json());

require("dotenv").config()
const PORT = process.env.PORT || 3000

app.get('/classes', (req, res) => {
    res.json({
        1:'bangbang-chicken',
        2:'dan-dan-noodles',
        3: 'sichuan-hot-pot',
        4: 'twice-cooked-pork',
        5: 'wontons-in-chili-oil',
    })
})

app.post('/predict', async (req, res) => {
    let { files } = req.body

    let pred_data = {}

    const pythonProcess = spawn('python', ['./pyscripts/models.py', ...files]);

    pythonProcess.stdout.on('data', (data) => {
        try {
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
            res.status(200).json(pred_data)
        } else {
            res.status(400).json({message: "Python script error", error: pred_data['stderr']})
        }
    });
})

app.listen(PORT, () => {
    console.log('Listing on port:', PORT)
})