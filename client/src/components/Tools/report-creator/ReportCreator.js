import React, { useEffect, useCallback, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  LinearProgress,
  RadioGroup,
  Select,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import DownloadIcon from "@mui/icons-material/Download";

import style from "./ReportCreator.module.css";
import config from "../../../config";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ReportCreator = React.memo(({ currentLanguage }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const [tableLanguage, setTableLanguage] = useState("ENG");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 0 : prevProgress + 1
      );
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleFileChange = useCallback(({ target }) => {
    setFile(target.files[0]);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setIsLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tableLanguage", tableLanguage);

      try {
        const response = await axios.post(
          `${config.apiURL}/make-exploits-table`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setDownloadLink(response.data.downloadLink);
        setFile(!file);
      } catch (error) {
        console.error(error);
        setDownloadLink(null);
      }

      setIsLoading(false);
    },
    [file, tableLanguage]
  );

  return (
    <Box className={style.report_creator} sx={{ textAlign: "center" }}>
      <Typography variant="h4">
        {currentLanguage === "ENG"
          ? "Create exploits table"
          : "Создать таблицу c эксплоитами"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl disabled>
          <FormLabel id="scanner select">
            {currentLanguage === "ENG"
              ? "Select Vulnerability Scanner"
              : "Выберите сканер уязвимостей"}
          </FormLabel>
          <RadioGroup defaultValue="REDCheck">
            <FormControlLabel
              value="REDCheck"
              control={<Radio />}
              label="REDCheck"
            />
            <FormControlLabel
              value="Max Patrol"
              control={<Radio />}
              label="Max Patrol"
            />
            <FormControlLabel
              value="Nexpose"
              control={<Radio />}
              label="Nexpose"
            />
            <FormControlLabel
              value="Acunetix"
              control={<Radio />}
              label="Acunetix"
            />
          </RadioGroup>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel id="tableLanguage">
            {currentLanguage === "ENG" ? "Language table" : "Язык таблицы"}
          </InputLabel>
          <Select
            value={tableLanguage}
            label="Language table"
            onChange={(e) => setTableLanguage(e.target.value)}
          >
            <MenuItem value={"ENG"}>
              {currentLanguage === "ENG" ? "English" : "Английский"}
            </MenuItem>
            <MenuItem value={"RUS"}>
              {currentLanguage === "ENG" ? "Russian" : "Русский"}
            </MenuItem>
          </Select>
        </FormControl>
        {file ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {currentLanguage === "ENG"
              ? `Uploaded File: ${file.name}`
              : `Загруженный файл: ${file.name}`}
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {currentLanguage === "ENG"
              ? "No file uploaded"
              : "Файл не загружен"}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              disabled={isLoading}
            >
              {currentLanguage === "ENG" ? "Upload" : "Загрузить"}
              <VisuallyHiddenInput
                type="file"
                accept=".xml, .pdf"
                onChange={handleFileChange}
              />
            </Button>
            <Button
              type="submit"
              disabled={!file || isLoading}
              variant="contained"
              endIcon={isLoading ? <HourglassBottomIcon /> : <SendIcon />}
              sx={{ ml: 2 }}
            >
              {isLoading
                ? currentLanguage === "ENG"
                  ? "Processing..."
                  : "Обработка..."
                : currentLanguage === "ENG"
                ? "Process"
                : "Обработать"}
            </Button>
          </Box>
          <Button
            disabled={isLoading || !downloadLink}
            onClick={() => (window.location.href = downloadLink)}
            type="button"
            variant="contained"
            endIcon={<DownloadIcon />}
            sx={{ mt: 2 }}
          >
            {currentLanguage === "ENG" ? "Download table" : "Скачать таблицу"}
          </Button>
        </Box>
      </form>

      <LinearProgress
        width="15%"
        variant="determinate"
        value={progress}
        sx={{ mt: 2 }}
      />
    </Box>
  );
});

export default ReportCreator;
