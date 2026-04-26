package com.surveybridge.client.mapper;

import com.surveybridge.client.dto.ClientDto;
import com.surveybridge.client.dto.ClientUserDto;
import com.surveybridge.client.entity.Client;
import com.surveybridge.client.entity.ClientUser;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClientMapper {
    ClientDto toDto(Client client);
    ClientUserDto toDto(ClientUser clientUser);
}
