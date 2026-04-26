package com.surveybridge.common;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public record PagedResult<T>(
    List<T> content,
    long totalElements,
    int totalPages,
    int page,
    int size
) {
    public static <T> PagedResult<T> of(Page<T> page) {
        return new PagedResult<>(
            page.getContent(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.getNumber(),
            page.getSize()
        );
    }

    public static <E, T> PagedResult<T> map(Page<E> page, Function<E, T> mapper) {
        return new PagedResult<>(
            page.getContent().stream().map(mapper).toList(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.getNumber(),
            page.getSize()
        );
    }
}
