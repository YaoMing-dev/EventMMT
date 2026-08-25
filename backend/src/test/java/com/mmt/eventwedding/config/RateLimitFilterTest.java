package com.mmt.eventwedding.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RateLimitFilterTest {

    @Test
    void allowsRequestsUnderTheLimitThenBlocksWithA429() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/leads");
            request.setRemoteAddr("1.2.3.4");
            filter.doFilter(request, new MockHttpServletResponse(), chain);
        }
        verify(chain, times(20)).doFilter(any(), any());

        MockHttpServletRequest blocked = new MockHttpServletRequest("POST", "/api/leads");
        blocked.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilter(blocked, blockedResponse, chain);

        assertThat(blockedResponse.getStatus()).isEqualTo(429);
        assertThat(blockedResponse.getHeader("Retry-After")).isEqualTo("60");
        verify(chain, times(20)).doFilter(any(), any());
    }

    @Test
    void tracksEachIpSeparately() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest exhausted = new MockHttpServletRequest("POST", "/api/chat");
            exhausted.setRemoteAddr("9.9.9.9");
            filter.doFilter(exhausted, new MockHttpServletResponse(), chain);
        }

        MockHttpServletRequest otherIp = new MockHttpServletRequest("POST", "/api/chat");
        otherIp.setRemoteAddr("8.8.8.8");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(otherIp, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(chain, times(21)).doFilter(any(), any());
    }

    @Test
    void doesNotLimitUnrelatedPaths() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 50; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/images/events");
            request.setRemoteAddr("1.1.1.1");
            filter.doFilter(request, new MockHttpServletResponse(), chain);
        }

        verify(chain, times(50)).doFilter(any(), any());
    }

    @Test
    void adminPathHasItsOwnHigherLimit() throws Exception {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain chain = mock(FilterChain.class);

        for (int i = 0; i < 30; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/leads");
            request.setRemoteAddr("5.5.5.5");
            filter.doFilter(request, new MockHttpServletResponse(), chain);
        }

        MockHttpServletRequest blocked = new MockHttpServletRequest("GET", "/api/admin/leads");
        blocked.setRemoteAddr("5.5.5.5");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilter(blocked, blockedResponse, chain);

        assertThat(blockedResponse.getStatus()).isEqualTo(429);
        verify(chain, times(30)).doFilter(any(), any());
    }
}
