package com.chahd.collabproject.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    String store(MultipartFile file, String subDir) throws IOException;
    Resource loadAsResource(String relativePath) throws IOException;
    void delete(String relativePath);
}
