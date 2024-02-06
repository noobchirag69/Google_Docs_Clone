const mongoose = require("mongoose");
const Document = require("./models/document");

require("dotenv").config();

mongoose
  .connect(process.env.dbURL)
  .then((result) => console.log("Connected to Database..."))
  .catch((error) => console.log("Error occured..."));

const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let defaultValue = "";

const findOrCreateDocument = async (id) => {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) {
    return document;
  } else {
    return await Document.create({ _id: id, data: defaultValue });
  }
};

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});
