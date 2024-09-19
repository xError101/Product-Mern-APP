

Make a folder and create 2 folder inside called backend and frontend

`npm init -y`
- Creates a package.json file

`npm install express mongoose dotenv`
- Express is the API 
- Mongoose is interacting with  database
- dotenv - environment variable

In our backend, make a sever.js file. 
- We import express to handle api
- `import express from "express";

To use this, we edit our package.json file and add a type called module
`  "type": "module",`

Server.js
- We call express by `const app = express();`
- We print out what port we are running
```
app.listen(5000, () => {
    console.log("Server started at http://localhost:5000/")
})
```

Package.json
- We can add a script in order to run the server.js as npm run dev 
```
"scripts": {
    "dev": "node backend/server.js"
},
```


When we try updating in the server.js console log, the change is not displayed unless the server is killed and restarted
- To fix this we can use nodemon
- `npm i nodemon -D`
- This install nodemon as our devDependencies
```
"devDependencies": {
    "nodemon": "^3.1.4"
}
```
In order to run this, we need to make sure server.js runs with nodemon not node in our package.json
`"dev": "nodemon backend/server.js"`

**==Getting routes==**

Setting get routes, we can use the following code
```
app.get("/", (req,res) => {
    res.send("Server is ready")
})
```
This means we use a get method and a response and request which those 2 make up the controller. If this is successful, we will get a response saying "Server is ready" on the webpage

In an Express.js application, the `req` (request) and `res` (response) objects play key roles in handling HTTP requests and responses.

We will be using products in order to get all the products from our database
`app.get("/product", (req,res) => {`

**==MongoDB==**
- Set up mongoDB 
- Make a .env file in the root directory
- Add the following `MONGO_URI = ########

In our server.js we can try read this MONGO_URI by `console.log(process.env.MONGO_URI)`, however this gives an error of undefined because we cannot read the .env file by default. To override this, we can import dotenv by `import dotenv from "dotenv";`. To finally use this we call this by `dotenv.config();`

To make our connection more clean, we make a folder in our backend called config and a file called db.js. We can make a function called connectDB which we can make asynchronous function which can display we are connected to which cluster. This is done by a try and catch method
```
import mongoose from 'mongoose';


export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1); //process code 1 code means exit with failure, 0 means success
    }
}
```
This export a function called connectDB which is asynchronous which means it can have the state fulfilled, pending or rejected. If rejected it would have the argument of error and will be displayed and the program would exit, if it was fulfilled it would display the cluster it is connected to. If it is pending, it would wait for connection.

In order to run this we can import connectDB by `import { connectDB } from "./config/db.js";
To run this we can call it:
```
app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000/")
})
```
The connectDB is placed inside of app.listen because in express, it is how server are initialised and that it is always running



SQL vs NoSQL
- SQL database, data are stored in tables, which have rows and columns
- NOSQL have collection and inside each collection is a document

Creating a Product model
- Make a folder called models in backend
- Create a file under models called product.model.js

In our product.model.js we create a model:
```
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },

}, {
    timestamps: true, //created at, updated at fields
});

const Product = mongoose.model('Product', productSchema);

export default Product;
```
This sets up an object called productSchema which inherits from mongoose.Schema which is imported. This then makes 3 objects called name, price and image. This is then given type of data type and if it is required. Then a timestamps allow there to be a created at and updated at fields. This then creates the model as Product by `const Product = mongoose.model('Product', productSchema);`. This use Product because in model parameter as mongoose wants it like that and it is the productSchema that is being used. This object now called Product is exported to be used in other parts of the project/codebase


**==Building API==**

**Checking Post Request**
```
app.post("/product", async (req,res) => {
    const product = req.body; // user will send this data

    if(!product.name || !product.price || !product.image) {
        return res.status(400).json({success:false, message: "Please provide all fields"});
    }

    const newProduct = new Product(product)

    try {
        await newProduct.save();
        res.status(201).json({success:true, data:newProduct});
    } catch (error) {
        console.error("Error in Create Product:", error.message);
        res.status(500).json({success:false, message:"Server Error"})
    }
})

```
- First of all this /product is now a post request
- The information sent to this post request is found in req.body which is saved as product
- If there is no name, price or image for the product there will be a 400 error where success is false and will print, "Please provide all fields"
- If there is no error, it will create the product called newProduct which will pass on the information typed retrieved by req.body by product
- It then tries to save and returns 201 code proving something is created. The data saved is the newProduct, what is created just now
- If it is unable to be saved, a 500 error is shown where a server error message is displayed 

It is good habit using /api to make us aware it is an api
`app.post("/api/products", async (req,res) => {`

We have our middleware which allows to allow JSON data in the req.body to be used
```
app.use(express.json()) //Allows us to accept JSON data in the req.body
```

**Delete Request**
```
app.delete("/api/products/:id", async (req,res) => {
    const {id} = req.params
    console.log("id:", id)
})
```
This creates a delete request where the ":id" means id is dynamic and can change to user input. Furthermore, the const {id} need to match after the colon so :"id". The request.params allows us to change the id to what the user has submitted in the url and this prints out the id after id: such as id:124 if input in url is /api/products/124

```
app.delete("/api/products/:id", async (req,res) => {
    const {id} = req.params
    try {
        await Product.findByIdAndDelete(id)
        res.status(200).json({success: true, message: "Product deleted"});
    } catch (error) {
        res.status(404).json({success:false, message:"Product not found"});
    }
})
```
This gets the id from params and searches for it in Product model. If it is there, returns True and product deleted or false and Not found


**Get Request**
```
app.get("/api/products", async (req,res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({success: true, data: products});
    } catch (error) {
        console.log("Error in fetching products:", error.message);
        res.status(500).json({success:false, message: "Server Error"})
    }
})
```
This gets all the products by checking the product model and by using `Product.find({})` we are able to get every item that we created. If it is able to do so, it returns true and shows all the products which are the documents which are individual entries. If there is an error an error is displayed saying Error in fetching product and give a 500 error code.


**Put Request**
```
app.put("/api/products/:id", async (req,res) => {
    const {id} = req.params;

    const product = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success:false, message:"Product not found"});
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, {new:true});
        res.status(200).json({success:true, data:updatedProduct});
    } catch (error) {
        res.status(500).json({success:false, message: "Server Error"});
    }
})
```
This creates a put request with :id to tell which product needs to be changed. The id can be received by the params of the request but the product by the body of the request. If there is no id found by the one that is searched for, it will give a 404 error stating "Product not found". This is searched for by the `!mongoose.Types.ObjectId.isValid(id)`. If there is a product with that id, there will be a 200 success code and will display the request as the new updateProduct. If there is an error, this is likely to be a server error hence a 500 error code is shown with Server error message


**Routes Organisation**
- In our backend, we have all our routes in server.js. This is not clear hence we can structure this better by going into our backend and making a folder called routes and a file called product.routes.js. 
- We can import following
```
import express from "express";
import mongoose from "mongoose";

import Product from "../models/product.model.js";
const router = express.Router();

```
This creates a router by express and the Product allows us to access the models such as id, body and params
```
import express from "express";
import mongoose from "mongoose";

import Product from "../models/product.model.js";
const router = express.Router();

router.get("/", async (req,res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({success: true, data: products});
    } catch (error) {
        console.log("Error in fetching products:", error.message);
        res.status(500).json({success:false, message: "Server Error"})
    }
})

router.post("/", async (req,res) => {
    const product = req.body; // user will send this data

    if(!product.name || !product.price || !product.image) {
        return res.status(400).json({success:false, message: "Please provide all fields"});
    }

    const newProduct = new Product(product)

    try {
        await newProduct.save();
        res.status(201).json({success:true, data:newProduct});
    } catch (error) {
        console.error("Error in Create Product:", error.message);
        res.status(500).json({success:false, message:"Server Error"})
    }
})

router.put("/:id", async (req,res) => {
    const {id} = req.params;

    const product = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success:false, message:"Product not found"});
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, {new:true});
        res.status(200).json({success:true, data:updatedProduct});
    } catch (error) {
        res.status(500).json({success:false, message: "Server Error"});
    }
})

router.delete("/:id", async (req,res) => {
    const {id} = req.params
    try {
        await Product.findByIdAndDelete(id)
        res.status(200).json({success: true, message: "Product deleted"});
    } catch (error) {
        console.log("Error in deleting product:", error.message)
        res.status(404).json({success:false, message:"Product not found"});
    }
})

export default router;
```
In order to run this we have to add this to our server.js to be able to allow it to run. 
```
import productRouters from "./routes/product.routes.js";
app.use("/api/products", productRouters)
```
This imports the routes in product.routes.js and use the prefix /api/products and routes the request based on productRoutes function. When importing it, you can call it whatever


**==Controllers==**

- A controller handles the incoming HTTP request such as POST, DELETE, GET, PUT
- It also determines what response to give back

We create a folder in our backend called controllers and create a file called product.controller.js to allow us to handle HTTP request and reponse

```
import Product from "../models/product.model.js";

export const getProducts = async (req,res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({success: true, data: products});
    } catch (error) {
        console.log("Error in fetching products:", error.message);
        res.status(500).json({success:false, message: "Server Error"})
    }
}
```
We created a new function called getProducts that can be used used in our product.routes.js to handle the GET request 

In our product.routes.js we can use it as so
`router.get("/", getProducts)`
- Make sure to import getProducts from product.controller.js

Final code here for all the request type
```
import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const getProducts = async (req,res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({success: true, data: products});
    } catch (error) {
        console.log("Error in fetching products:", error.message);
        res.status(500).json({success:false, message: "Server Error"})
    }
}

export const createProduct = async (req,res) => {
    const product = req.body; // user will send this data

    if(!product.name || !product.price || !product.image) {
        return res.status(400).json({success:false, message: "Please provide all fields"});
    }

    const newProduct = new Product(product)

    try {
        await newProduct.save();
        res.status(201).json({success:true, data:newProduct});
    } catch (error) {
        console.error("Error in Create Product:", error.message);
        res.status(500).json({success:false, message:"Server Error"})
    }
}

export const updateProduct =  async (req,res) => {
    const {id} = req.params;

    const product = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success:false, message:"Product not found"});
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, {new:true});
        res.status(200).json({success:true, data:updatedProduct});
    } catch (error) {
        res.status(500).json({success:false, message: "Server Error"});
    }
}

export const deleteProduct = async (req,res) => {
    const {id} = req.params
    try {
        await Product.findByIdAndDelete(id)
        res.status(200).json({success: true, message: "Product deleted"});
    } catch (error) {
        console.log("Error in deleting product:", error.message)
        res.status(404).json({success:false, message:"Product not found"});
    }
}
```

Programming Practise
- Add port to our dotenv file
- `PORT=5000`
- In our server.js import this port by making a new variable called PORT with code `const PORT = process.env.PORT || 5000`. The || means if there is no PORT, then 5000 will be used regardless
- So we can it 
```
app.listen(PORT, () => {
    connectDB();
    console.log("Server started at http://localhost:"+PORT)
}) 
```



**==Creating Frontend==**
- We can get vite and select react then javascript
```
- PS C:\xError Projects\product-mern> cd frontend
PS C:\xError Projects\product-mern\frontend> npm create vite@latest .
```

Vite is a component that allows you to choose your template quickly depending on your language preference

Since we want to use chakra, we would need to download this and wrap this in our main.jsx
```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>,
)

```
Since app is ran, we need to fix this 
```
import { Button } from "@chakra-ui/react"

function App() {
  return (
    <>
      <Button>
        Hello
      </Button>
    </>
  )
}
export default App

```
This all makes a button which as the text Hello inside of it which is provided by Chakra

To have multiple pages we would need react-router-dom
- `import {BrowserRouter} from "react-router-dom"`

In our main.jsx we would like to have BrowserRouter
```
import {BrowserRouter} from "react-router-dom"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

This will allow us to navigate to different pages


==**Creating our NavBar**==
In our app.jsx we will need routes in order to navigate to different pages
```
import { Box } from "@chakra-ui/react"
function App() {
  return (
    <Box minH={"100vh"}>
      {/* <Navbar />*/}
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/create" element={<CreatePage />}/>
      </Routes>
    </Box>
  )
}

export default App

```
These paths allow us to access the homepage and the create page. We need to create these pages, so we'll create a folder called `pages` in our frontend directory and add `HomePage.jsx` and `CreatePage.jsx` (or `.js`).

To construct a navbar, we need to create a component. We'll create a `components` folder in our frontend directory and add a file called `Navbar.jsx`.

**Creating these pages:**
- In our HomePage, CreatePage and Navbar we can use the snipper 'rafce' to construct a function temporary
```
import React from 'react'

const Navbar = () => {
  return (
    <div>Navbar</div>
  )
}

export default Navbar
```

We can now import this into our app.jsx and we will see Navbar and HomePage text 
```
import { Box } from "@chakra-ui/react"
import {Route,Routes} from "react-router-dom"
import HomePage from "./pages/HomePage"
import CreatePage from "./pages/CreatePage"
import Navbar from "./components/Navbar"


function App() {
  return (
    <Box minH={"100vh"}>
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/create" element={<CreatePage />}/>
      </Routes>
    </Box>
  )
}

export default App
```


To make the navbar the code is as follows:
```
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { Container, Flex, HStack, Text, Button } from '@chakra-ui/react';

const Navbar = () => {
  return (
    <Container maxW={"1140px"} px={4}>
      <Flex 
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row"
        }}
      >
        <Text
          fontSize={{ base: "22", sm: "28" }}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          textAlign={"center"}
          bgGradient={"linear(to-r, cyan.400, blue.500)"}
          bgClip={"text"}
        >
          <Link to={"/"}>Product Store 🛒</Link>
        </Text>

        <HStack spacing={2} alignItems={"center"}>
          <Link to={"/create"}>
            <Button>
              <PlusSquareIcon fontSize={20} />
            </Button>
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
}

export default Navbar;
```
In our navbar we create a container which defines the positioning of other buttons and Text. The container acts as a wrapper for the other elements

**To create toggle colour mode we use hooks**
- **What are hooks?**
	- Hooks are tools use to allow interactivity by using the common hook of useEffect, useState, useContext, useReducer.
	- For our colour mode, we will use useColorMode which comes from chakra UI. 

```
          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? "🌙": "🌞"}
          </Button>
```

The button uses a hook by chakra and this is initiated when clicking. This would check the color mode and if it is light, a moon is present or if it is dark,  a sun is present

To make it more better looking, we can use react icons
`{colorMode === "light" ? <IoMoon/>: <LuSun size="20"/>}`

To use these icons, we can import these by 
```
import { IoMoon } from 'react-icons/io5';
import { LuSun } from 'react-icons/lu';
```

**Change background colour of page**
```
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
```
In our app.jsx, we added this background to the box which means it determines the whole background colour of the page as minvh fills the whole viewport by 100%. The `Box` with `minH={"100vh"}` ensures that the background color is applied to the entire visible area of the browser window. As you scroll through the page, the background color of the `Box` will remain consistent, even though you’re moving through additional content.. If in light mode, gray.100 is used but gray.900 is used in dark mode

**==Create Page==**
```
const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });
```
This uses a useState react hook which sets the name, price and image to "" and when the user enters there own information, it is updated and saved as setNewProduct


```
import { Button, useColorModeValue, VStack, Container, Heading, Box, Input} from '@chakra-ui/react';
import React from 'react'
import { useState } from 'react';

const CreatePage = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
  });
  return (
    <Container maxW={"container.sm"}>
      <VStack spacing={8}>
        <Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
          Create New Product
        </Heading>

        <Box 
          w={"full"} bg={useColorModeValue("white", "grey.800")}
          p={6} rounded={"lg"} shadow={"md"}
        >
          <VStack spacing={4}>
            <Input 
              placeholder='Product Name'
              name='name'
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <Input 
              placeholder='Price'
              name='price'
              type='number'
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            />
            <Input 
              placeholder='Image'
              name='image'
              value={newProduct.image}
              onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
            />

          {/* <Button colorScheme='blue' onClick={handleAddProduct} w='full'>Add Product</Button> */}
          </VStack>


        </Box>
      </VStack>
    </Container>
  )
}

export default CreatePage
```
We create a container which is a wrapper for all our input and buttons to go. We used a vertical stack in order to display our input. There are 3 input name, price and image URL. The price input has a extra parameter of type to be a number. The value is the new state NewProduct and we update each of the parameter to the user input. To allow the input field to change we use OnChange event handler with e being our event(such as typing and the onChange is the event handler sorting what to do). The box is used for each of the input field to  create a container and have round edges with full width and the color is derived from the light or dark mode , light having white and dark have gray.800

**Submit button**

```
<Button colorScheme='blue' onClick={handleAddProduct} w='full'>Add Product</Button>
```
This is above the end of VStack and this button essentially calls a function called handleAddProduct when button is clicked. Further to alert user of what this button does it is called "Add Product"

```
  const handleAddProduct = () => {
    console.log(newProduct);
  }
```
When we input something, this is handled by event handler and in this case NewProduct initally would be "". However upon typing which initiates a request, this will trigger setNewProduct to update NewProduct to the input. In our code, when we run the handleAppProduct function, we will output newProduct in our console tab in browser. This will be what the user inputted since it was originally part of setNewProduct but is now newProduct since newProduct is updated by setNewProduct

**==Creating a global state
- We are using zustand `npm i zustand` to get a global state
- In our frontend folder, and in our src folder we create a store folder. Under the store folder, we create a file called product.js
```
import {create} from "zustand";

export const useProductStore = create((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    createProduct:  async (newProduct) => {
        if(!newProduct.name|| !newProduct.image || !newProduct.price) {
            return {success:false, message:"Please fill in all fields"}
        }
        const res = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify(newProduct),
        });
        const data = await res.json();
        set((state) => ({products:[...state.products, data.data]}));
        return {success:true, message:"Product created successfully"};
    },
}));
```
In our product.js, we can import zustand. From here we create a custom hook called useProductStore and we take the arguement set to be created. Set updates the state. We create object products as object go after ({. We create the method setProducts which take the parameter of products, this will mean set updates the state of product. So we will check if the product have all the fields or it will return "Please fill in all fields". If all fields are filled, we create a variable called res which will send a post request to get all the products. The content-type tells the applicationwe are sending a json file. The body:Json stringify adds the newProduct field as a json string to the database. The variable data will wait for the response of json. It then waits to be fulfilled since res.json has await so there is a promise, and then set updates the state of products and returns the success and message.

```
  const {createProduct} = useProductStore()

  const handleAddProduct = async() => {
    const {success, message} = await createProduct(newProduct);
    console.log("Success", success);
    console.log("Message", message);
  }
```
To run this, we create a new variable called createProduct to run useProductStore in our product.js file function. This then is called in handleAddProduct which is what is run after the submit button is pressed and then outputs the success and the message.

**Using toast to display result**
```
  const toast = useToast()
  const {createProduct} = useProductStore()

  const handleAddProduct = async() => {
    const {success, message} = await createProduct(newProduct);
    if(!success) {
      toast({
        "title": "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true
      })
    } else {
      toast({
        "title": "Success",
        description: message,
        status: "success",
        duration: 5000,
        isClosable: true
      })
    }
    setNewProduct({ name: "", price: "", image: ""});
    };
```
So we import toast from Chakra UI. We create a toast if the success message is false or true. They both will have a message which is in product.js file. It will also give a status  which is predefined and will close itself in 5 seconds or you can close it yourself


**==Creating home page==**

**Create a title in the landing page**
- In our frontend, src and inside the pages folder we would have HomePage.jsx.
```
import React from 'react';
import {Container, VStack, Text} from '@chakra-ui/react';

const HomePage = () => {
  return (
    <Container maxW='container.xl' py={12}>
      <VStack spacing={8}>
      <Text
					fontSize={"30"}
					fontWeight={"bold"}
					bgGradient={"linear(to-r, cyan.400, blue.500)"}
					bgClip={"text"}
					textAlign={"center"}
				>
					Current Products 🚀
				</Text>
      </VStack>
    </Container>
  )
}

export default HomePage
```
This imports all the container, vstack and text from chakra UI. In this we can create a container that will be expanded to the whole width which wraps every of our element inside. We can create a vertical stack for our title Current Products that uses colour blending on top and is displayed at the center.



**Create no product found message**
```
        <Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						No products found 😢{" "}
						<Link to={"/create"}>
							<Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
								Create a product
							</Text>
						</Link>
					</Text>
```
This will create a text field and will link to /create for the Create a product message and underline


**Create grid view**
```
    fetchProducts: async() => {
        const res = await fetch("/api/products")
        const data = await res.json();
        set({ products: data.data });
    }
```
This creates fetchProduct function and has 2 variable res and data. Res stores the response of the get request and the data parses the json file into JavaScript object


```
				<SimpleGrid
					columns={{
						base: 1,
						md: 2,
						lg: 3,
					}}
					spacing={10}
					w={"full"}
				>
				</SimpleGrid>

```
This creates a grid in our HomePage.jsx and we have columns based on size of screen. 
JSON
`"{ \"name\": \"Product A\", \"price\": 10.99 }"`
JavaScript
```
{
  name: "Product A",
  price: 10.99
}
```

```
  const {fetchProducts, products} = useProductStore();
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  console.log("products", products)
```
This destructs two properties from useProductStore() as fetchProducts and products. This useEffect react hook is used when the fetchProduct is loaded first, it is updated. The code `console.log("products", products)` outputs the string "products" and then the list products


ProductCard
```
					{products.map((product) => (
						<ProductCard key={product._id} product={product} />
					))}
					
```

The maps create a list for each product and is uniquely identified by the id and the name stays the way it is for each product



ProductCard.jsx - A file under frontend, src, components and create file called ProductCard.jsx
```
import React from 'react'
import { Box, useColorModeValue, Image, Text } from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Heading, HStack, IconButton } from '@chakra-ui/react'

const ProductCard = ({ product }) => {  // Destructure `product` from props
    const textColor = useColorModeValue("gray.600", "gray.200")
    const bg = useColorModeValue("white", "gray.800")

    return (
        <Box
            shadow='lg'
            rounded='lg'
            overflow='hidden'
            transition='all 0.3s'
            _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
            bg={bg}
        >
            <Image src={product.image} alt={product.name} h={48} w='full' objectFit='cover'/>
            <Box p={4}>
                <Heading as='h3' size='md' mb={2}>
                    {product.name}
                </Heading>
                <Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
                    ${product.price}
                </Text>
                <HStack spacing={2}>
                    <IconButton icon={<EditIcon />} colorScheme='blue' />
                    <IconButton icon={<DeleteIcon />} colorScheme='red' />
                </HStack>
            </Box>
        </Box>
    )
}

export default ProductCard

```

ProductCard has to be created which takes product as the parameter. Then we create a box which is used to define the space of the grid. This also tells the grid when it is hovered over, the cards to go up vertically a bit. From there, the image is added and the name is below, with the price. We also have 2 buttons for each of the cards, edit and delete in order to edit and delete the product which is in a horizontal stack.


**No Product message if no product**
```
				{products.length === 0 && (
					<Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						No products found 😢{" "}
						<Link to={"/create"}>
							<Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
								Create a product
							</Text>
						</Link>
					</Text>
				)}
```
Since we don't want our No product found if there is product, we check the length of products and if it is 0 it will give this text otherwise it would not appear

**Delete product**

```
    deleteProduct: async (pid) => {
        const res = await fetch(`/api/products/${pid}`, {
          method: "DELETE",  
        });
        const data = await res.json();
        if(!data.success) return { success: false, message: data.message};
        //update ui immediately, without needing a refresh
        set(state => ({ products: state.products.filter(product => product._id !== pid)})); 
        return { success: true, message: data.message};
        
    }
```
This code creates a deleteProduct function in product.js under store in frontend. This will use a variable called res which will send a delete request with the product id and the variable data parses the json to a javascript object to be read. If there is no data, it would return false otherwise it will delete the product and update the screen immediately so no need to refresh and give a success of true and message respectively

```
    const {deleteProduct} = useProductStore()
    const toast = useToast()

    const handleDeleteProduct = async (pid) => {
        const {success,message} = await deleteProduct(pid)
        if(!success){
            toast({
                "title": "Error",
                description: message,
                status: "error",
                duration: 5000,
                isClosable: true
              })
            } else {
            toast({
                "title": "Success",
                description: message,
                status: "success",
                duration: 5000,
                isClosable: true
              })
        }
    }
```
`<IconButton icon={<DeleteIcon />} onClick={() => handleDeleteProduct(product._id)} colorScheme='red' />`
This imports deleteProduct from useProductStore and imports toast. Then the handleDeleteMessage is called when delete button is pressed, with the parameter of pid. This deconstructs the success and the message and this async function would give an error if there is no success or success if it is all good


**Edit Product**

```
<Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>

                <ModalContent>
                    <ModalHeader>Update Product</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                    <VStack spacing={4}>
							<Input
								placeholder='Product Name'
								name='name'
							/>
							<Input
								placeholder='Price'
								name='price'
								type='number'
							/>
							<Input
								placeholder='Image URL'
								name='image'
							/>
						</VStack>
                        </ModalBody>
                </ModalContent>

            </Modal>
```

```
<IconButton icon={<EditIcon/>} onClick={onOpen} colorScheme='blue' />
```
This creates a modal that is called isOpen to open it and isClose to close it. It has the 3 input which we need which are the same for when we create a product and are in a vertical stack

In order for the update Modal to have the update or cancel button we must include modal footer
```
<ModalFooter>
						<Button
							colorScheme='blue'
							mr={3}
						>
							Update
						</Button>
						<Button variant='ghost' onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
```
The button will run and only when cancel onClick button is used and will run onClose.

```
const ProductCard = ({ product }) => {  // Destructure `product` from props
    const [updatedProduct, setUpdatedProduct] =  useState(product);
```
To get the existing data to the modal, we can use a state as updateProduct and the new updated to be setUpdatedProduct. To display the existing values we can use value: `value = {updatedProduct.name}` and .price and .image for each of the other fields respectively

In our global state we would need to create updateProduct which is in our store folder and called product.jsx

```
    updateProduct: async (pid, updateProduct) => {
        const res = await fetch(`/api/products/${pid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateProduct),
        });
        const data = await res.json();
        if (!data.success) return { success:false, message: data.message};

        // update the ui immediately without needing a refresh
        set(state => ({
            products: state.products.map(product => product._id === pid ? data.data : product)
        }))
    }
```
"This `res` sends a `PUT` request, and the `headers` specify that the data is being sent in JSON format. By using `body` and `JSON.stringify`, we convert the JavaScript object (`updateProduct`) into a JSON string. If there is no data or if `data.success` is `false`, the function will return an error. Otherwise, it maps through the list of products, finds the product with the matching `id`, and updates its data. If no match is found, it returns the original product unchanged."

Creating a toast for successful update
```
const {success,message} = await updateProduct(pid, updatedProduct);
        onClose();
        if(!success){
            toast({
                "title": "Error",
                description: message,
                status: "error",
                duration: 5000,
                isClosable: true
              })
            } else {
            toast({
                "title": "Success",
                description: "Product updated successfully",
                status: "success",
                duration: 5000,
                isClosable: true
              })
        }
```
This checks the success and if it is successful it will output success or else it would be error. We cannot give a message because in our backend, we just return data and success so we have to create our own custom message in our try method. 




