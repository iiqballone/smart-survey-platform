package com.surveybridge.dynata;

import com.surveybridge.common.exception.DynataIntegrationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Component
@RequiredArgsConstructor
public class DynataWebhookValidator {

    private final DynataProperties props;

    public void validate(String signature, byte[] body) {
        if (signature == null || signature.isBlank()) {
            throw new AccessDeniedException("Missing X-Dynata-Signature header");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                props.getWebhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String computed = HexFormat.of().formatHex(mac.doFinal(body));
            if (!computed.equals(signature)) {
                throw new AccessDeniedException("Invalid webhook signature");
            }
        } catch (AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new DynataIntegrationException("Signature validation failed", e);
        }
    }
}
