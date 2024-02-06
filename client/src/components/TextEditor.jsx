import { useState, useEffect, useCallback } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export const TextEditor = () => {
  const { id: documentId } = useParams();

  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  useEffect(() => {
    const tempSocket = io("http://localhost:3000");
    setSocket(tempSocket);
    return () => {
      tempSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const textHandler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", textHandler);
    return () => {
      quill.off("text-change", textHandler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const textHandler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", textHandler);
    return () => {
      socket.off("receive-changes", textHandler);
    };
  }, [socket, quill]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const tempQuill = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    });
    tempQuill.disable();
    tempQuill.setText("Loading...");
    setQuill(tempQuill);
  }, []);

  return (
    <>
      <div id="bossWrapper" ref={wrapperRef}></div>
    </>
  );
};
