package com.surveybridge.client.service;

import com.surveybridge.client.entity.Client;
import com.surveybridge.client.repository.ClientRepository;
import com.surveybridge.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public Client getById(UUID id) {
        return clientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }
}
