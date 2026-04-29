package com.carpinchill.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservaRequest {

    @NotNull(message = "El viaje es obligatorio")
    private Long viajeId;

    @NotNull
    @Min(value = 1, message = "Mínimo 1 persona")
    private Integer numPersonas;

    private String notas;
}
